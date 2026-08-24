"use client";

import { useEffect, useRef, useState } from "react";
import { cx } from "@/src/components/ui/cx";

type Point = {
  x: number;
  y: number;
};

type GlyphCommand =
  | { type: "M"; x: number; y: number }
  | { type: "L"; x: number; y: number }
  | { type: "Q"; x1: number; y1: number; x: number; y: number }
  | { type: "C"; x1: number; y1: number; x2: number; y2: number; x: number; y: number }
  | { type: "Z" };

type OpenTypeFont = {
  getPath: (
    char: string,
    x: number,
    y: number,
    fontSize: number,
  ) => { commands: GlyphCommand[] };
};

type OpenTypeGlobal = {
  load: (url: string, callback: (error: Error | null, font: OpenTypeFont) => void) => void;
};

type P5Renderer = {
  parent: (node: HTMLElement) => void;
};

type P5Instance = {
  WEBGL: string;
  ROUND: string;
  QUADS: string;
  TRIANGLES: string;
  CLOSE: string;
  width: number;
  height: number;
  mouseX: number;
  mouseY: number;
  frameCount: number;
  setup: () => void;
  draw: () => void;
  windowResized: () => void;
  createCanvas: (width: number, height: number, renderer: string) => P5Renderer;
  resizeCanvas: (width: number, height: number) => void;
  pixelDensity: (density: number) => void;
  strokeJoin: (join: string) => void;
  strokeCap: (cap: string) => void;
  clear: () => void;
  push: () => void;
  pop: () => void;
  scale: (scale: number) => void;
  rotateY: (angle: number) => void;
  rotateX: (angle: number) => void;
  fill: (color: string) => void;
  noStroke: () => void;
  noFill: () => void;
  stroke: (color: string) => void;
  strokeWeight: (weight: number) => void;
  beginShape: (kind?: string) => void;
  endShape: (mode?: string) => void;
  vertex: (x: number, y: number, z?: number) => void;
  camera: (
    eyeX: number,
    eyeY: number,
    eyeZ: number,
    centerX: number,
    centerY: number,
    centerZ: number,
    upX: number,
    upY: number,
    upZ: number,
  ) => void;
  remove: () => void;
};

type P5Constructor = new (
  sketch: (p: P5Instance) => void,
  node: HTMLElement,
) => P5Instance;

type MeshGroup = {
  vertices: number[];
  indices: number[];
};

type ContourNode = {
  index: number;
  contour: Point[];
  area: number;
  parent: number | null;
  depth: number;
};

declare global {
  interface Window {
    p5?: P5Constructor;
    opentype?: OpenTypeGlobal;
    earcut?: (vertices: number[], holes: number[], dimensions: number) => number[];
  }
}

const LOGO = {
  char: "$",
  yellow: "#FFC400",
  black: "#111111",
  fontSize: 340,
  depth: 58,
  curveSteps: 14,
  edgeWeight: 2,
  rotateSpeed: 0.018,
  cameraNormal: 760,
  zoomEase: 0.075,
  minScale: 0.05,
  maxScale: 1,
  hoverWidth: 240,
  hoverHeight: 300,
};

const FONT_URL =
  "https://cdn.jsdelivr.net/fontsource/fonts/bowlby-one@5.3.0/latin-400-normal.woff";
const P5_URL = "https://cdn.jsdelivr.net/npm/p5@1.11.3/lib/p5.min.js";
const OPENTYPE_URL = "https://cdn.jsdelivr.net/npm/opentype.js@1.3.4/dist/opentype.min.js";
const EARCUT_URL = "https://cdn.jsdelivr.net/npm/earcut@2.2.4/dist/earcut.min.js";

const scriptPromises = new Map<string, Promise<void>>();

function loadScript(src: string, isReady: () => boolean) {
  if (isReady()) {
    return Promise.resolve();
  }

  const existingPromise = scriptPromises.get(src);

  if (existingPromise) {
    return existingPromise;
  }

  const promise = new Promise<void>((resolve, reject) => {
    const existingScript = document.querySelector<HTMLScriptElement>(
      `script[src="${src}"]`,
    );

    if (existingScript) {
      existingScript.addEventListener("load", () => resolve(), { once: true });
      existingScript.addEventListener("error", () => reject(new Error(src)), {
        once: true,
      });
      return;
    }

    const script = document.createElement("script");

    script.src = src;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(src));
    document.head.appendChild(script);
  });

  scriptPromises.set(src, promise);
  return promise;
}

function pointsEqual(a: Point, b: Point) {
  return Math.abs(a.x - b.x) < 0.001 && Math.abs(a.y - b.y) < 0.001;
}

function quadraticPoint(p0: Point, p1: Point, p2: Point, t: number) {
  const mt = 1 - t;

  return {
    x: mt * mt * p0.x + 2 * mt * t * p1.x + t * t * p2.x,
    y: mt * mt * p0.y + 2 * mt * t * p1.y + t * t * p2.y,
  };
}

function cubicPoint(p0: Point, p1: Point, p2: Point, p3: Point, t: number) {
  const mt = 1 - t;

  return {
    x:
      mt * mt * mt * p0.x +
      3 * mt * mt * t * p1.x +
      3 * mt * t * t * p2.x +
      t * t * t * p3.x,
    y:
      mt * mt * mt * p0.y +
      3 * mt * mt * t * p1.y +
      3 * mt * t * t * p2.y +
      t * t * t * p3.y,
  };
}

function pathToContours(commands: GlyphCommand[], curveSteps: number) {
  const contours: Point[][] = [];
  let contour: Point[] = [];
  let current = { x: 0, y: 0 };
  let start = { x: 0, y: 0 };

  function closeCurrentContour() {
    if (contour.length < 3) {
      contour = [];
      return;
    }

    if (!pointsEqual(contour[0], contour[contour.length - 1])) {
      contour.push({ ...contour[0] });
    }

    contours.push(contour);
    contour = [];
  }

  for (const command of commands) {
    if (command.type === "M") {
      if (contour.length) {
        closeCurrentContour();
      }

      current = { x: command.x, y: command.y };
      start = { ...current };
      contour = [{ ...current }];
    } else if (command.type === "L") {
      current = { x: command.x, y: command.y };
      contour.push({ ...current });
    } else if (command.type === "Q") {
      const p0 = { ...current };
      const p1 = { x: command.x1, y: command.y1 };
      const p2 = { x: command.x, y: command.y };

      for (let i = 1; i <= curveSteps; i += 1) {
        contour.push(quadraticPoint(p0, p1, p2, i / curveSteps));
      }

      current = p2;
    } else if (command.type === "C") {
      const p0 = { ...current };
      const p1 = { x: command.x1, y: command.y1 };
      const p2 = { x: command.x2, y: command.y2 };
      const p3 = { x: command.x, y: command.y };

      for (let i = 1; i <= curveSteps; i += 1) {
        contour.push(cubicPoint(p0, p1, p2, p3, i / curveSteps));
      }

      current = p3;
    } else if (command.type === "Z") {
      current = { ...start };
      closeCurrentContour();
    }
  }

  if (contour.length) {
    closeCurrentContour();
  }

  return contours;
}

function cleanContours(contours: Point[][]) {
  return contours
    .map((contour) => {
      const clean: Point[] = [];

      for (const point of contour) {
        const previous = clean[clean.length - 1];

        if (!previous || !pointsEqual(previous, point)) {
          clean.push({ x: point.x, y: point.y });
        }
      }

      if (clean.length > 2 && pointsEqual(clean[0], clean[clean.length - 1])) {
        clean.pop();
      }

      return clean;
    })
    .filter((contour) => contour.length >= 3);
}

function centerContours(contours: Point[][]) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const contour of contours) {
    for (const point of contour) {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    }
  }

  const centerX = (minX + maxX) / 2;
  const centerY = (minY + maxY) / 2;

  for (const contour of contours) {
    for (const point of contour) {
      point.x -= centerX;
      point.y -= centerY;
    }
  }
}

function calculateBounds(contours: Point[][]) {
  let minX = Infinity;
  let maxX = -Infinity;
  let minY = Infinity;
  let maxY = -Infinity;

  for (const contour of contours) {
    for (const point of contour) {
      minX = Math.min(minX, point.x);
      maxX = Math.max(maxX, point.x);
      minY = Math.min(minY, point.y);
      maxY = Math.max(maxY, point.y);
    }
  }

  return {
    width: maxX - minX,
    height: maxY - minY,
  };
}

function polygonSignedArea(polygon: Point[]) {
  let area = 0;

  for (let i = 0; i < polygon.length; i += 1) {
    const a = polygon[i];
    const b = polygon[(i + 1) % polygon.length];

    area += a.x * b.y - b.x * a.y;
  }

  return area / 2;
}

function pointInPolygon(point: Point, polygon: Point[]) {
  let inside = false;

  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const intersects =
      yi > point.y !== yj > point.y &&
      point.x < ((xj - xi) * (point.y - yi)) / (yj - yi) + xi;

    if (intersects) {
      inside = !inside;
    }
  }

  return inside;
}

function getContourSamplePoint(polygon: Point[]) {
  const average = polygon.reduce(
    (total, point) => ({
      x: total.x + point.x / polygon.length,
      y: total.y + point.y / polygon.length,
    }),
    { x: 0, y: 0 },
  );

  if (pointInPolygon(average, polygon)) {
    return average;
  }

  const first = polygon[0];

  return {
    x: first.x + (average.x - first.x) * 0.01,
    y: first.y + (average.y - first.y) * 0.01,
  };
}

function buildContourTree(contours: Point[][]) {
  const nodes: ContourNode[] = contours.map((contour, index) => ({
    index,
    contour,
    area: Math.abs(polygonSignedArea(contour)),
    parent: null,
    depth: 0,
  }));

  for (const node of nodes) {
    const samplePoint = getContourSamplePoint(node.contour);
    let bestParent: number | null = null;
    let bestParentArea = Infinity;

    for (const candidate of nodes) {
      if (candidate.index === node.index || candidate.area <= node.area) {
        continue;
      }

      if (pointInPolygon(samplePoint, candidate.contour) && candidate.area < bestParentArea) {
        bestParent = candidate.index;
        bestParentArea = candidate.area;
      }
    }

    node.parent = bestParent;
  }

  for (const node of nodes) {
    let depth = 0;
    let parent = node.parent;
    const visited = new Set<number>();

    while (parent !== null && !visited.has(parent)) {
      visited.add(parent);
      depth += 1;
      parent = nodes[parent].parent;
    }

    node.depth = depth;
  }

  return nodes;
}

function createEarcutGroup(outer: Point[], holes: Point[][], earcut: Window["earcut"]) {
  if (!earcut) {
    return { vertices: [], indices: [] };
  }

  const vertices: number[] = [];
  const holeIndices: number[] = [];
  let vertexCount = 0;

  for (const point of outer) {
    vertices.push(point.x, point.y);
    vertexCount += 1;
  }

  for (const hole of holes) {
    holeIndices.push(vertexCount);

    for (const point of hole) {
      vertices.push(point.x, point.y);
      vertexCount += 1;
    }
  }

  return {
    vertices,
    indices: earcut(vertices, holeIndices, 2),
  };
}

function buildMeshGroups(contours: Point[][], nodes: ContourNode[]) {
  const groups: MeshGroup[] = [];

  for (const node of nodes) {
    if (node.depth % 2 !== 0) {
      continue;
    }

    const outer = contours[node.index];
    const holes = nodes
      .filter(
        (candidate) =>
          candidate.parent === node.index && candidate.depth === node.depth + 1,
      )
      .map((candidate) => contours[candidate.index]);

    groups.push(createEarcutGroup(outer, holes, window.earcut));
  }

  return groups;
}

function mapRange(
  value: number,
  inputMin: number,
  inputMax: number,
  outputMin: number,
  outputMax: number,
) {
  const ratio = Math.min(1, Math.max(0, (value - inputMin) / (inputMax - inputMin)));

  return outputMin + ratio * (outputMax - outputMin);
}

function createLogoSketch(
  container: HTMLElement,
  onReady: () => void,
  onError: (error: unknown) => void,
) {
  return (p: P5Instance) => {
    let rawContours: Point[][] = [];
    let meshGroups: MeshGroup[] = [];
    let logoReady = false;
    let cameraZ = LOGO.cameraNormal;
    let logoBounds = { width: 0, height: 0 };

    function getCanvasSize() {
      const bounds = container.getBoundingClientRect();
      const size = Math.max(1, Math.round(Math.min(bounds.width, bounds.height)));

      return { width: size, height: size };
    }

    function getNormalCameraZ() {
      const shortest = Math.min(p.width, p.height);

      return mapRange(shortest, 32, 160, 840, LOGO.cameraNormal);
    }

    function isLogoHovered() {
      const centerX = p.width / 2;
      const centerY = p.height / 2;
      const hoverWidth = Math.min(LOGO.hoverWidth, p.width * 0.7);
      const hoverHeight = Math.min(LOGO.hoverHeight, p.height * 0.7);

      return (
        p.mouseX > centerX - hoverWidth &&
        p.mouseX < centerX + hoverWidth &&
        p.mouseY > centerY - hoverHeight &&
        p.mouseY < centerY + hoverHeight
      );
    }

    function updateCamera() {
      const normalZ = getNormalCameraZ();
      const targetZ = isLogoHovered() ? normalZ * 0.86 : normalZ;

      cameraZ += (targetZ - cameraZ) * LOGO.zoomEase;
      p.camera(0, -34, cameraZ, 0, 0, 0, 0, 1, 0);
    }

    function getResponsiveScale() {
      if (!logoBounds.width || !logoBounds.height) {
        return 1;
      }

      const scaleX = (p.width * 0.72) / logoBounds.width;
      const scaleY = (p.height * 0.78) / logoBounds.height;

      return Math.min(LOGO.maxScale, Math.max(LOGO.minScale, Math.min(scaleX, scaleY)));
    }

    function drawTriangleVertex(vertices: number[], index: number, z: number) {
      p.vertex(vertices[index * 2], vertices[index * 2 + 1], z);
    }

    function drawSideWalls(frontZ: number, backZ: number) {
      p.fill(LOGO.black);
      p.noStroke();

      for (const contour of rawContours) {
        p.beginShape(p.QUADS);

        for (let i = 0; i < contour.length; i += 1) {
          const a = contour[i];
          const b = contour[(i + 1) % contour.length];

          p.vertex(a.x, a.y, frontZ);
          p.vertex(b.x, b.y, frontZ);
          p.vertex(b.x, b.y, backZ);
          p.vertex(a.x, a.y, backZ);
        }

        p.endShape();
      }
    }

    function drawCaps(z: number, reverse: boolean) {
      p.fill(LOGO.yellow);
      p.noStroke();

      for (const group of meshGroups) {
        p.beginShape(p.TRIANGLES);

        for (let i = 0; i < group.indices.length; i += 3) {
          let a = group.indices[i];
          const b = group.indices[i + 1];
          let c = group.indices[i + 2];

          if (reverse) {
            const originalA = a;

            a = c;
            c = originalA;
          }

          drawTriangleVertex(group.vertices, a, z);
          drawTriangleVertex(group.vertices, b, z);
          drawTriangleVertex(group.vertices, c, z);
        }

        p.endShape();
      }
    }

    function drawContourEdges(z: number) {
      p.noFill();
      p.stroke(LOGO.black);
      p.strokeWeight(LOGO.edgeWeight);
      p.strokeJoin(p.ROUND);
      p.strokeCap(p.ROUND);

      for (const contour of rawContours) {
        p.beginShape();

        for (const point of contour) {
          p.vertex(point.x, point.y, z);
        }

        p.endShape(p.CLOSE);
      }
    }

    function drawDollarMesh() {
      const frontZ = LOGO.depth / 2;
      const backZ = -LOGO.depth / 2;

      drawSideWalls(frontZ, backZ);
      drawCaps(frontZ, false);
      drawCaps(backZ, true);
      drawContourEdges(frontZ);
      drawContourEdges(backZ);
    }

    function buildLogoGeometry(font: OpenTypeFont) {
      const glyphPath = font.getPath(LOGO.char, 0, 0, LOGO.fontSize);

      rawContours = cleanContours(pathToContours(glyphPath.commands, LOGO.curveSteps));
      centerContours(rawContours);
      logoBounds = calculateBounds(rawContours);
      meshGroups = buildMeshGroups(rawContours, buildContourTree(rawContours));
    }

    p.setup = () => {
      const { width, height } = getCanvasSize();
      const canvas = p.createCanvas(width, height, p.WEBGL);

      canvas.parent(container);
      p.pixelDensity(Math.min(window.devicePixelRatio || 1, 2));
      p.strokeJoin(p.ROUND);
      p.strokeCap(p.ROUND);
      cameraZ = getNormalCameraZ();

      window.opentype?.load(FONT_URL, (error, font) => {
        if (error) {
          onError(error);
          return;
        }

        buildLogoGeometry(font);
        logoReady = true;
        onReady();
      });
    };

    p.draw = () => {
      p.clear();

      if (!logoReady) {
        return;
      }

      updateCamera();

      p.push();
      p.scale(getResponsiveScale());
      p.rotateY(p.frameCount * LOGO.rotateSpeed);
      p.rotateX(-0.025);
      drawDollarMesh();
      p.pop();
    };

    p.windowResized = () => {
      const { width, height } = getCanvasSize();

      p.resizeCanvas(width, height);
      cameraZ = getNormalCameraZ();
    };
  };
}

export function PayLaLogo3D({
  className,
}: {
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const instanceRef = useRef<P5Instance | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    let cancelled = false;

    if (!container) {
      return undefined;
    }

    setReady(false);

    Promise.all([
      loadScript(P5_URL, () => Boolean(window.p5)),
      loadScript(OPENTYPE_URL, () => Boolean(window.opentype)),
      loadScript(EARCUT_URL, () => Boolean(window.earcut)),
    ])
      .then(() => {
        if (cancelled || !window.p5) {
          return;
        }

        instanceRef.current = new window.p5(
          createLogoSketch(
            container,
            () => {
              if (!cancelled) {
                setReady(true);
              }
            },
            (error) => {
              console.error("Pay La logo failed to load:", error);
            },
          ),
          container,
        );
      })
      .catch((error) => {
        console.error("Pay La logo scripts failed to load:", error);
      });

    return () => {
      cancelled = true;
      instanceRef.current?.remove();
      instanceRef.current = null;
    };
  }, []);

  return (
    <div
      ref={containerRef}
      role="img"
      aria-label="Pay La"
      className={cx(
        "relative grid size-12 place-items-center overflow-hidden",
        "[&_canvas]:block",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className={cx(
          "type-h3 absolute inset-0 grid place-items-center text-primary-foreground transition-opacity",
          ready ? "opacity-0" : "opacity-100",
        )}
      >
        $
      </span>
    </div>
  );
}

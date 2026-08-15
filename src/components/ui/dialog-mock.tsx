import { Button } from "./button";
import { Frame } from "./frame";

export function DialogMock() {
  return (
    <Frame surface="background" className="p-3">
      <div className="mb-4 flex items-center justify-between border-b-[3px] border-border pb-2">
        <h3 className="type-h3">
          Delete expense?
        </h3>
        <button className="grid size-8 place-items-center border-[3px] border-border bg-surface-raised font-black">
          x
        </button>
      </div>
      <p className="type-small text-muted">
        This removes Ramen dinner and updates every member balance.
      </p>
      <div className="mt-5 grid grid-cols-2 gap-3">
        <Button variant="ghost">Cancel</Button>
        <Button variant="danger">Delete</Button>
      </div>
    </Frame>
  );
}

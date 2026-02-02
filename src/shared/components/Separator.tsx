import { type HTMLProps, type FC } from "react";
import { cn } from "../utils/helpers";

type Props = {
  orientation?: "horizontal" | "vertical";
} & HTMLProps<HTMLDivElement>;

const Separator: FC<Props> = (props) => {
  const { orientation = "horizontal", className, ...rest } = props;

  return (
    <div className="w-full">
      <div
        className={cn(
          "shrink-0 bg-blue-faded",
          orientation === "horizontal" ? "h-[1px] w-full" : "h-full w-[1px]",
          className
        )}
        {...rest}
      />
    </div>
  );
};

export default Separator;

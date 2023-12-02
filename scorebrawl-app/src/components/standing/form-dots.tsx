import { type PlayerForm } from "~/server/api/types";

export const FormDots = ({ form }: { form: PlayerForm }) => {
  return (
    <div className="flex gap-1">
      {form.map((r, i) => {
        if (r === "W") {
          return <div key={`${r}-${i}`} className="h-2 w-2 rounded-full bg-green-400"></div>;
        } else if (r === "D") {
          return (
            <div
              key={`${r}-${i}`}
              className="h-2 w-2 rounded-full bg-yellow-500 dark:bg-yellow-400"
            ></div>
          );
        } else {
          return <div key={`${r}-${i}`} className="h-2 w-2 rounded-full bg-rose-900"></div>;
        }
      })}
    </div>
  );
};

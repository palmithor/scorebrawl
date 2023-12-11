import { zodResolver } from "@hookform/resolvers/zod";
import { type ReactNode, useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { LoadingButton } from "~/components/ui/loading-button";
import { useToast } from "~/components/ui/use-toast";
import { api } from "~/lib/api";

const formSchema = z.object({
  name: z.string().nonempty({ message: "name must not be empty." }),
});

export const UpdateTeamDialog = ({
  leagueSlug,
  team,
  children,
}: {
  leagueSlug: string;
  team: { id: string; name: string };
  children: ReactNode;
}) => {
  const [open, setOpen] = useState(false);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: team.name,
    },
  });
  const { league } = api.useContext();
  const { mutate: updateTeam, isLoading } = api.team.update.useMutation();
  const { toast } = useToast();

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    updateTeam(
      { leagueSlug, teamId: team.id, name: values.name },
      {
        onSuccess: () => {
          void league.getTeams.invalidate({ leagueSlug });
          setOpen(false);
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Error",
            description: "Error updating team.",
          });
        },
      },
    );
  };

  return (
    <Form {...form}>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Team</DialogTitle>
          </DialogHeader>

          <form
            onSubmit={(e) => {
              void form.handleSubmit(onSubmit)(e);
            }}
            className="space-y-8"
            noValidate
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input autoComplete="off" placeholder="team name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <LoadingButton loading={isLoading} type="submit">
                Save
              </LoadingButton>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Form>
  );
};

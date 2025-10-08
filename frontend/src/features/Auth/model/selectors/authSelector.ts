import { StateSchema } from "@/app/providers/Store/config/StateSchema";

export const selectCurrentUser = (state: StateSchema) => state.auth.user;

import { http } from "@/api/intercept";

export const shelfNumberService = {
  list: () => http.get<unknown>("/shelf-numbers"),
};

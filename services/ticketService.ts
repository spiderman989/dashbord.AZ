import type { Ticket } from "@/types";
import { createMockRepository } from "./mockRepository";
export const ticketService = createMockRepository<Ticket>("tickets", []);

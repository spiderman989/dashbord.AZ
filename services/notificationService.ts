import { notifications } from "@/data/employees";
import { createMockRepository } from "./mockRepository";
export const notificationService = createMockRepository("notifications", notifications);

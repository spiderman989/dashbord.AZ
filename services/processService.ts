import { processes, quickProcesses } from "@/data/processes";
import { createMockRepository } from "./mockRepository";
export const processService = createMockRepository("processes", processes);
export const quickProcessService = createMockRepository("quick-processes", quickProcesses);
export const getProcesses = processService.list;
export const getProcessById = processService.get;
export const getQuickProcesses = quickProcessService.list;
export async function getEmployeeProcesses(employeeId: string) { return (await getProcesses()).filter((item) => item.employeeId === employeeId); }

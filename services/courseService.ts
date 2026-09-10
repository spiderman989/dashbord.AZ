import { courses } from "@/data/courses";
import { createMockRepository } from "./mockRepository";
export const courseService = createMockRepository("courses", courses);
export const getCourses = courseService.list;
export const getCourseById = courseService.get;

import "reflect-metadata";
import { DataSource } from "typeorm";
import { CreateUsers1763500000000 } from "../database/migrations/1763500000000-CreateUsers";
import { CreateAcademicCalendar1763500001000 } from "../database/migrations/1763500001000-CreateAcademicCalendar";
import { CreateProfessors1763500002000 } from "../database/migrations/1763500002000-CreateProfessors";
import { CreateAssignments1763500003000 } from "../database/migrations/1763500003000-CreateAssignments";
import { CreateTimetables1763500004000 } from "../database/migrations/1763500004000-CreateTimetables";
import { CreateAnnouncementsAndFees1763500005000 } from "../database/migrations/1763500005000-CreateAnnouncementsAndFees";
import { CreateStudents1763500006000 } from "../database/migrations/1763500006000-CreateStudents";
import { AcademicYear } from "../models/AcademicYear";
import { Announcement } from "../models/Announcement";
import { Assignment } from "../models/Assignment";
import { AssignmentAttachment } from "../models/AssignmentAttachment";
import { Discipline } from "../models/Discipline";
import { Professor } from "../models/Professor";
import { Semester } from "../models/Semester";
import { Student } from "../models/Student";
import { Fee } from "../models/Fee";
import { Timetable } from "../models/Timetable";
import { User } from "../models/User";
import { env } from "./env";
import { createDatabaseAdapter } from "./database";

export const databaseAdapter = createDatabaseAdapter(env);

export const AppDataSource = new DataSource(
  databaseAdapter.buildOptions({
    entities: [
      User,
      AcademicYear,
      Semester,
      Discipline,
      Professor,
      Assignment,
      AssignmentAttachment,
      Timetable,
      Announcement,
      Fee,
      Student,
    ],
    migrations: [
      CreateUsers1763500000000,
      CreateAcademicCalendar1763500001000,
      CreateProfessors1763500002000,
      CreateAssignments1763500003000,
      CreateTimetables1763500004000,
      CreateAnnouncementsAndFees1763500005000,
      CreateStudents1763500006000,
    ],
    synchronize: false,
    logging: env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  }),
);

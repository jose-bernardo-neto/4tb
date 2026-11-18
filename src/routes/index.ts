import { Router } from "express";
import { AcademicYearController } from "../controllers/AcademicYearController";
import { AlunoController } from "../controllers/AlunoController";
import { AnnouncementController } from "../controllers/AnnouncementController";
import { AssignmentController } from "../controllers/AssignmentController";
import { AuthController } from "../controllers/AuthController";
import { DashboardController } from "../controllers/DashboardController";
import { DisciplineController } from "../controllers/DisciplineController";
import { FeeController } from "../controllers/FeeController";
import { ProfessorController } from "../controllers/ProfessorController";
import { SemesterController } from "../controllers/SemesterController";
import { StudentController } from "../controllers/StudentController";
import { TimetableController } from "../controllers/TimetableController";
import { ensureAuthenticated, ensureGuest } from "../middlewares/auth";
import { loginRateLimit } from "../middlewares/rateLimit";
import { uploadAttachments, uploadCsvFile, uploadSingleFile } from "../middlewares/upload";

const authController = new AuthController();
const dashboardController = new DashboardController();
const academicYearController = new AcademicYearController();
const semesterController = new SemesterController();
const professorController = new ProfessorController();
const disciplineController = new DisciplineController();
const assignmentController = new AssignmentController();
const timetableController = new TimetableController();
const studentController = new StudentController();
const announcementController = new AnnouncementController();
const feeController = new FeeController();
const alunoController = new AlunoController();

export const router = Router();

router.get("/login", ensureGuest, authController.showLogin);
router.post("/login", loginRateLimit, ensureGuest, authController.login);
router.post("/logout", authController.logout);

router.get("/turma", studentController.home);
router.get("/turma/professores", studentController.professors);
router.get("/turma/cadeiras", studentController.disciplines);
router.get("/turma/tarefas", studentController.assignments);
router.get("/turma/tarefas/:id", studentController.assignment);
router.get("/turma/anexos/:id", studentController.attachment);
router.get("/turma/anexos/:id/download", studentController.attachment);
router.get("/turma/comunicados", studentController.announcements);
router.get("/turma/emolumentos", studentController.fees);

router.use(ensureAuthenticated);
router.get("/", dashboardController.index);

router.get("/anos-letivos", academicYearController.index);
router.post("/anos-letivos", academicYearController.create);
router.get("/anos-letivos/:id", academicYearController.show);
router.post("/anos-letivos/:id", academicYearController.update);
router.post("/anos-letivos/:id/apagar", academicYearController.destroy);

router.post("/semestres/:id/ativar", semesterController.activate);
router.get("/semestres/:id/cadeiras", disciplineController.index);
router.post("/semestres/:id/cadeiras", disciplineController.create);
router.get("/semestres/:id/tarefas", assignmentController.index);
router.post("/semestres/:id/tarefas", uploadAttachments, assignmentController.create);
router.get("/semestres/:id/horario", timetableController.show);
router.post("/semestres/:id/horario", uploadSingleFile, timetableController.save);
router.get("/semestres/:id/horario/ficheiro", timetableController.file);
router.get("/semestres/:id/horario/ficheiro/download", timetableController.file);
router.get("/semestres/:id/comunicados", announcementController.index);
router.post("/semestres/:id/comunicados", announcementController.create);
router.get("/semestres/:id/emolumentos", feeController.index);
router.post("/semestres/:id/emolumentos", feeController.create);

router.get("/professores", professorController.index);
router.post("/professores", professorController.create);
router.get("/professores/:id", professorController.show);
router.post("/professores/:id", professorController.update);
router.post("/professores/:id/apagar", professorController.destroy);

router.get("/cadeiras/:id", disciplineController.show);
router.post("/cadeiras/:id", disciplineController.update);
router.post("/cadeiras/:id/apagar", disciplineController.destroy);

router.get("/tarefas/:id", assignmentController.show);
router.post("/tarefas/:id", uploadAttachments, assignmentController.update);
router.post("/tarefas/:id/apagar", assignmentController.destroy);

router.get("/anexos/:id", assignmentController.download);
router.get("/anexos/:id/download", assignmentController.download);
router.post("/anexos/:id/apagar", assignmentController.removeAttachment);

router.get("/comunicados/:id", announcementController.show);
router.post("/comunicados/:id", announcementController.update);
router.post("/comunicados/:id/apagar", announcementController.destroy);

router.get("/emolumentos/:id", feeController.show);
router.post("/emolumentos/:id", feeController.update);
router.post("/emolumentos/:id/apagar", feeController.destroy);

router.get("/alunos", alunoController.index);
router.post("/alunos", alunoController.create);
router.post("/alunos/importar", uploadCsvFile, alunoController.importCsv);
router.get("/alunos/:id", alunoController.show);
router.post("/alunos/:id", alunoController.update);
router.post("/alunos/:id/apagar", alunoController.destroy);

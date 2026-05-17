-- CreateTable
CREATE TABLE "Trajectory" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT false,
    "color" TEXT NOT NULL DEFAULT '#7c3aed',
    "startDate" TIMESTAMP(3) NOT NULL,
    "targetDate" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Trajectory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Milestone" (
    "id" TEXT NOT NULL,
    "trajectoryId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planned',
    "targetDate" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "dependencies" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "order" INTEGER NOT NULL DEFAULT 0,
    "weight" INTEGER NOT NULL DEFAULT 1,
    "bucket" TEXT,

    CONSTRAINT "Milestone_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlanPeriod" (
    "id" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "startsOn" TIMESTAMP(3) NOT NULL,
    "themeMd" TEXT,
    "goalsMd" TEXT,
    "reviewMd" TEXT,

    CONSTRAINT "PlanPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Task" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "status" TEXT NOT NULL DEFAULT 'todo',
    "priority" TEXT NOT NULL DEFAULT 'med',
    "category" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "dueDate" TIMESTAMP(3),
    "startDate" TIMESTAMP(3),
    "estimateMin" INTEGER,
    "actualMin" INTEGER,
    "recurrence" TEXT,
    "parentId" TEXT,
    "milestoneId" TEXT,
    "jobId" TEXT,
    "projectId" TEXT,
    "learningId" TEXT,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Task_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Habit" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "emoji" TEXT,
    "cadence" TEXT NOT NULL,
    "targetMin" INTEGER,
    "color" TEXT NOT NULL DEFAULT '#10b981',
    "archived" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "Habit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "HabitLog" (
    "id" TEXT NOT NULL,
    "habitId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT true,
    "minutes" INTEGER,
    "note" TEXT,

    CONSTRAINT "HabitLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoutineBlock" (
    "id" TEXT NOT NULL,
    "dayOfWeek" INTEGER NOT NULL,
    "startMin" INTEGER NOT NULL,
    "endMin" INTEGER NOT NULL,
    "label" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "color" TEXT,

    CONSTRAINT "RoutineBlock_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LearningItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "provider" TEXT,
    "url" TEXT,
    "topic" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" TEXT NOT NULL DEFAULT 'backlog',
    "progressPct" INTEGER NOT NULL DEFAULT 0,
    "rating" INTEGER,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "totalMin" INTEGER,
    "hoursLogged" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notesMd" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "LearningItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Project" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "tagline" TEXT,
    "status" TEXT NOT NULL DEFAULT 'idea',
    "repoUrl" TEXT,
    "demoUrl" TEXT,
    "blogUrl" TEXT,
    "stack" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "audioMl" BOOLEAN NOT NULL DEFAULT false,
    "readmeMd" TEXT,
    "coverImg" TEXT,
    "startedAt" TIMESTAMP(3),
    "shippedAt" TIMESTAMP(3),
    "hours" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "metrics" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Project_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Job" (
    "id" TEXT NOT NULL,
    "company" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "location" TEXT,
    "country" TEXT,
    "band" TEXT,
    "source" TEXT,
    "jdUrl" TEXT,
    "jdSnapshot" TEXT,
    "visaSponsor" TEXT,
    "salaryMin" INTEGER,
    "salaryMax" INTEGER,
    "currency" TEXT DEFAULT 'EUR',
    "status" TEXT NOT NULL DEFAULT 'to_apply',
    "appliedAt" TIMESTAMP(3),
    "lastContactAt" TIMESTAMP(3),
    "nextFollowUp" TIMESTAMP(3),
    "contactId" TEXT,
    "notesMd" TEXT,
    "resumeId" TEXT,
    "coverLetterId" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Job_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobEvent" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "kind" TEXT NOT NULL,
    "body" TEXT,

    CONSTRAINT "JobEvent_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contact" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "company" TEXT,
    "role" TEXT,
    "location" TEXT,
    "linkedin" TEXT,
    "email" TEXT,
    "type" TEXT,
    "warmth" INTEGER NOT NULL DEFAULT 1,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "lastTouch" TIMESTAMP(3),
    "nextTouch" TIMESTAMP(3),
    "notesMd" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Contact_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Touch" (
    "id" TEXT NOT NULL,
    "contactId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "channel" TEXT NOT NULL,
    "outcome" TEXT,
    "bodyMd" TEXT,

    CONSTRAINT "Touch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "OutreachTemplate" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "audience" TEXT NOT NULL,
    "bodyMd" TEXT NOT NULL,
    "variables" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OutreachTemplate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewQuestion" (
    "id" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "subTopic" TEXT,
    "prompt" TEXT NOT NULL,
    "answerMd" TEXT,
    "difficulty" INTEGER NOT NULL DEFAULT 2,
    "lastReviewed" TIMESTAMP(3),
    "confidence" INTEGER NOT NULL DEFAULT 1,
    "source" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "InterviewQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MockInterview" (
    "id" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "partner" TEXT,
    "topic" TEXT NOT NULL,
    "durationMin" INTEGER NOT NULL,
    "rating" INTEGER,
    "notesMd" TEXT,
    "recordingUrl" TEXT,

    CONSTRAINT "MockInterview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemDesignCase" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "domain" TEXT NOT NULL,
    "promptMd" TEXT NOT NULL,
    "solutionMd" TEXT,
    "diagramSvg" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "SystemDesignCase_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisaTrack" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "pathway" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'planning',
    "startedAt" TIMESTAMP(3),
    "filedAt" TIMESTAMP(3),
    "decisionAt" TIMESTAMP(3),
    "notesMd" TEXT,

    CONSTRAINT "VisaTrack_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VisaDocument" (
    "id" TEXT NOT NULL,
    "trackId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'missing',
    "fileUrl" TEXT,
    "expiresAt" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "VisaDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RelocationChecklist" (
    "id" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "item" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "done" BOOLEAN NOT NULL DEFAULT false,
    "dueDate" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "RelocationChecklist_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "openingBalance" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "type" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "merchant" TEXT,
    "note" TEXT,
    "recurring" BOOLEAN NOT NULL DEFAULT false,
    "recurrenceRule" TEXT,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BudgetLine" (
    "id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "monthlyAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',

    CONSTRAINT "BudgetLine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SavingsGoal" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "targetAmount" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "targetDate" TIMESTAMP(3),
    "currentAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "notesMd" TEXT,

    CONSTRAINT "SavingsGoal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FxRate" (
    "id" TEXT NOT NULL,
    "base" TEXT NOT NULL,
    "quote" TEXT NOT NULL,
    "rate" DOUBLE PRECISION NOT NULL,
    "fetchedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "FxRate_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SalaryScenario" (
    "id" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "grossAnnual" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL,
    "taxClass" TEXT,
    "hasChurchTax" BOOLEAN NOT NULL DEFAULT false,
    "publicHealthRate" DOUBLE PRECISION,
    "pensionRate" DOUBLE PRECISION,
    "expectedNet" DOUBLE PRECISION,
    "notes" TEXT,
    "computedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SalaryScenario_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CityCOL" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "rentMin" DOUBLE PRECISION NOT NULL,
    "rentMax" DOUBLE PRECISION NOT NULL,
    "groceriesMin" DOUBLE PRECISION NOT NULL,
    "groceriesMax" DOUBLE PRECISION NOT NULL,
    "transport" DOUBLE PRECISION NOT NULL,
    "utilities" DOUBLE PRECISION NOT NULL,
    "internet" DOUBLE PRECISION NOT NULL,
    "fitness" DOUBLE PRECISION NOT NULL,
    "diningPerMeal" DOUBLE PRECISION NOT NULL,
    "totalMin" DOUBLE PRECISION NOT NULL,
    "totalMax" DOUBLE PRECISION NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'EUR',
    "source" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CityCOL_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "variant" TEXT,
    "contentJson" JSONB NOT NULL,
    "targetCompany" TEXT,
    "targetRole" TEXT,
    "pdfPath" TEXT,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CoverLetter" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "bodyMd" TEXT NOT NULL,
    "targetCompany" TEXT,
    "targetRole" TEXT,
    "jobId" TEXT,
    "variables" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoverLetter_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlogPost" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'idea',
    "audience" TEXT,
    "outlineMd" TEXT,
    "bodyMd" TEXT,
    "publishedUrl" TEXT,
    "publishedAt" TIMESTAMP(3),
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],

    CONSTRAINT "BlogPost_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReadingItem" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "author" TEXT,
    "url" TEXT,
    "kind" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'queue',
    "rating" INTEGER,
    "highlightsMd" TEXT,
    "addedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ReadingItem_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Event" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "kind" TEXT NOT NULL,
    "city" TEXT,
    "country" TEXT,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "url" TEXT,
    "cfpDeadline" TIMESTAMP(3),
    "attending" BOOLEAN NOT NULL DEFAULT false,
    "notesMd" TEXT,

    CONSTRAINT "Event_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL DEFAULT 'singleton',
    "baseCurrency" TEXT NOT NULL DEFAULT 'INR',
    "displayCurrency" TEXT NOT NULL DEFAULT 'EUR',
    "theme" TEXT NOT NULL DEFAULT 'dark',
    "weekStartsOn" INTEGER NOT NULL DEFAULT 1,
    "targetCountries" TEXT[] DEFAULT ARRAY['DE', 'ES', 'SE', 'FI', 'NL']::TEXT[],
    "workdayStartMin" INTEGER NOT NULL DEFAULT 540,
    "workdayEndMin" INTEGER NOT NULL DEFAULT 1080,
    "germanLevel" TEXT NOT NULL DEFAULT 'A0',
    "spanishLevel" TEXT NOT NULL DEFAULT 'A0',
    "englishLevel" TEXT NOT NULL DEFAULT 'C1',
    "apiKeys" JSONB,

    CONSTRAINT "Settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanPeriod_kind_startsOn_key" ON "PlanPeriod"("kind", "startsOn");

-- CreateIndex
CREATE UNIQUE INDEX "HabitLog_habitId_date_key" ON "HabitLog"("habitId", "date");

-- CreateIndex
CREATE INDEX "FxRate_base_quote_idx" ON "FxRate"("base", "quote");

-- CreateIndex
CREATE UNIQUE INDEX "FxRate_base_quote_fetchedAt_key" ON "FxRate"("base", "quote", "fetchedAt");

-- CreateIndex
CREATE UNIQUE INDEX "CityCOL_city_country_key" ON "CityCOL"("city", "country");

-- CreateIndex
CREATE UNIQUE INDEX "BlogPost_slug_key" ON "BlogPost"("slug");

-- AddForeignKey
ALTER TABLE "Milestone" ADD CONSTRAINT "Milestone_trajectoryId_fkey" FOREIGN KEY ("trajectoryId") REFERENCES "Trajectory"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "Task"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Task" ADD CONSTRAINT "Task_learningId_fkey" FOREIGN KEY ("learningId") REFERENCES "LearningItem"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "HabitLog" ADD CONSTRAINT "HabitLog_habitId_fkey" FOREIGN KEY ("habitId") REFERENCES "Habit"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Job" ADD CONSTRAINT "Job_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobEvent" ADD CONSTRAINT "JobEvent_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "Job"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Touch" ADD CONSTRAINT "Touch_contactId_fkey" FOREIGN KEY ("contactId") REFERENCES "Contact"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "VisaDocument" ADD CONSTRAINT "VisaDocument_trackId_fkey" FOREIGN KEY ("trackId") REFERENCES "VisaTrack"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_accountId_fkey" FOREIGN KEY ("accountId") REFERENCES "Account"("id") ON DELETE CASCADE ON UPDATE CASCADE;


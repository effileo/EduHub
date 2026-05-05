-- CreateTable
CREATE TABLE "PeerReviewAssignment" (
    "id" TEXT NOT NULL,
    "submissionId" TEXT NOT NULL,
    "reviewerId" TEXT NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PeerReviewAssignment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PeerReview" (
    "id" TEXT NOT NULL,
    "assignmentId" TEXT NOT NULL,
    "rubricScores" JSONB NOT NULL,
    "feedback" TEXT NOT NULL,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PeerReview_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PeerReviewAssignment_submissionId_reviewerId_key" ON "PeerReviewAssignment"("submissionId", "reviewerId");

-- CreateIndex
CREATE UNIQUE INDEX "PeerReview_assignmentId_key" ON "PeerReview"("assignmentId");

-- AddForeignKey
ALTER TABLE "PeerReviewAssignment" ADD CONSTRAINT "PeerReviewAssignment_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeerReviewAssignment" ADD CONSTRAINT "PeerReviewAssignment_reviewerId_fkey" FOREIGN KEY ("reviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PeerReview" ADD CONSTRAINT "PeerReview_assignmentId_fkey" FOREIGN KEY ("assignmentId") REFERENCES "PeerReviewAssignment"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

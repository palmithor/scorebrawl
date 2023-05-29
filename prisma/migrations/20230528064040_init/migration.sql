-- CreateEnum
CREATE TYPE "LeagueMemberRole" AS ENUM ('viewer', 'member', 'editor', 'owner');

-- CreateTable
CREATE TABLE "SeasonPlayer" (
    "id" STRING NOT NULL,
    "leaguePlayerId" STRING NOT NULL,
    "disabled" BOOL NOT NULL DEFAULT false,
    "seasonId" STRING NOT NULL,
    "elo" INT4 NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SeasonPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeagueMember" (
    "id" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" STRING NOT NULL,
    "leagueId" STRING NOT NULL,
    "role" "LeagueMemberRole" NOT NULL,

    CONSTRAINT "LeagueMember_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeaguePlayer" (
    "id" STRING NOT NULL,
    "userId" STRING NOT NULL,
    "leagueId" STRING NOT NULL,
    "disabled" BOOL NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "LeaguePlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "League" (
    "id" STRING NOT NULL,
    "logoUrl" STRING,
    "name" STRING NOT NULL,
    "nameSlug" STRING NOT NULL,
    "code" STRING NOT NULL,
    "archived" BOOL NOT NULL DEFAULT false,
    "isPrivate" BOOL NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" STRING NOT NULL,
    "updatedBy" STRING NOT NULL,

    CONSTRAINT "League_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Season" (
    "id" STRING NOT NULL,
    "name" STRING NOT NULL,
    "initialElo" INT4 NOT NULL,
    "kFactor" INT4 NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate" TIMESTAMP(3),
    "leagueId" STRING NOT NULL,
    "createdBy" STRING NOT NULL,
    "updatedBy" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Season_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchPlayer" (
    "id" STRING NOT NULL,
    "seasonPlayerId" STRING NOT NULL,
    "elo" INT4 NOT NULL,
    "homeTeam" BOOL NOT NULL,
    "matchId" STRING NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchPlayer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Match" (
    "id" STRING NOT NULL,
    "seasonId" STRING NOT NULL,
    "homeScore" INT4 NOT NULL,
    "awayScore" INT4 NOT NULL,
    "homeExpectedElo" FLOAT8 NOT NULL,
    "awayExpectedElo" FLOAT8 NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdBy" STRING NOT NULL,

    CONSTRAINT "Match_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "SeasonPlayer_leaguePlayerId_seasonId_key" ON "SeasonPlayer"("leaguePlayerId", "seasonId");

-- CreateIndex
CREATE UNIQUE INDEX "LeagueMember_userId_leagueId_key" ON "LeagueMember"("userId", "leagueId");

-- CreateIndex
CREATE UNIQUE INDEX "LeaguePlayer_userId_leagueId_key" ON "LeaguePlayer"("userId", "leagueId");

-- CreateIndex
CREATE UNIQUE INDEX "League_code_key" ON "League"("code");

-- CreateIndex
CREATE UNIQUE INDEX "League_nameSlug_key" ON "League"("nameSlug");

-- AddForeignKey
ALTER TABLE "SeasonPlayer" ADD CONSTRAINT "SeasonPlayer_leaguePlayerId_fkey" FOREIGN KEY ("leaguePlayerId") REFERENCES "LeaguePlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SeasonPlayer" ADD CONSTRAINT "SeasonPlayer_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeagueMember" ADD CONSTRAINT "LeagueMember_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LeaguePlayer" ADD CONSTRAINT "LeaguePlayer_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Season" ADD CONSTRAINT "Season_leagueId_fkey" FOREIGN KEY ("leagueId") REFERENCES "League"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchPlayer" ADD CONSTRAINT "MatchPlayer_seasonPlayerId_fkey" FOREIGN KEY ("seasonPlayerId") REFERENCES "SeasonPlayer"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchPlayer" ADD CONSTRAINT "MatchPlayer_matchId_fkey" FOREIGN KEY ("matchId") REFERENCES "Match"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Match" ADD CONSTRAINT "Match_seasonId_fkey" FOREIGN KEY ("seasonId") REFERENCES "Season"("id") ON DELETE CASCADE ON UPDATE CASCADE;

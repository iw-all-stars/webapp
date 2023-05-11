-- DropForeignKey
ALTER TABLE "Post" DROP CONSTRAINT "Post_storyId_fkey";

-- AddForeignKey
ALTER TABLE "Post" ADD CONSTRAINT "Post_storyId_fkey" FOREIGN KEY ("storyId") REFERENCES "Story"("id") ON DELETE CASCADE ON UPDATE CASCADE;

// src/resumeParser.ts
import fs from "node:fs";
import path from "node:path";

export type Job = {
  company: string;
  role: string;
  start: string;
  end: string;
};

export type Resume = {
  jobs: Job[];
};

/**
 * Parse a resume file (e.g. resume/resume.md) into structured Job entries.
 * For demo: expect lines like "Role: Software Engineer at OpenAI (2021 - 2023)"
 */
export function parseResume(resumePath: string): Resume {
  const fullPath = path.resolve(resumePath);
  const raw = fs.readFileSync(fullPath, "utf-8");

  const jobRegex =
    /Role:\s*(.+?)\s+at\s+(.+?)\s+\((.+?)\s*-\s*(.+?)\)/g;

  const jobs: Job[] = [];
  let m: RegExpExecArray | null;
  while ((m = jobRegex.exec(raw)) !== null) {
    jobs.push({
      role: m[1],
      company: m[2],
      start: m[3],
      end: m[4],
    });
  }

  return { jobs };
}

/**
 * Very simple Q&A over the parsed resume.
 * Expand with NLP if you want, but this is deterministic.
 */
export function answerQuestion(resume: Resume, question: string): string {
  const q = question.toLowerCase();

  if (q.includes("last role") || q.includes("most recent job")) {
    const last = resume.jobs[0];
    if (!last) return "No jobs found in resume.";
    return `Your most recent role was ${last.role} at ${last.company} (${last.start} - ${last.end}).`;
  }

  if (q.includes("all roles") || q.includes("positions")) {
    if (resume.jobs.length === 0) return "No jobs found in resume.";
    return resume.jobs
      .map((j) => `${j.role} at ${j.company} (${j.start} - ${j.end})`)
      .join("\n");
  }

  return "Sorry, I couldn’t find an answer for that question in your resume.";
}

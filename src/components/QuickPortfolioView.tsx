import React from 'react';
import {
  ArrowLeft,
  Check,
  Clock,
  Copy,
  ExternalLink,
  Github,
  Hammer,
  Mail,
} from 'lucide-react';
import { CONTENT } from '../content';
import {
  PixelMessengerOwl,
  PixelPortrait,
  QuestEnvironmentArt,
  SkillArtifactSprite,
} from './RealmArt';

import type { SfxKind } from '../audio/realmAudio';

interface QuickPortfolioViewProps {
  onSwitchToStory: () => void;
  onCopyEmail: () => void;
  emailCopied: boolean;
  onPlaySfx?: (kind: SfxKind) => void;
}

export function QuickPortfolioView({
  onSwitchToStory,
  onCopyEmail,
  emailCopied,
  onPlaySfx,
}: QuickPortfolioViewProps) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-8">
      {/* Fast-Lane Header Card */}
      <section className="pixel-panel p-5 sm:p-7 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 rounded-lg border-3 border-[#2B2B2B] overflow-hidden shrink-0 bg-[#F2E8D5]">
            <PixelPortrait className="w-full h-full" />
          </div>
          <div>
            <p className="font-pixel text-[10px] text-[#C17A5A] mb-1">
              QUICK PORTFOLIO
            </p>
            <h1 className="font-pixel text-lg sm:text-2xl text-[#2B2B2B] mb-1">
              {CONTENT.meta.playerName}
            </h1>
            <p className="text-base font-bold text-[#56694A]">
              {CONTENT.meta.roleLine}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onSwitchToStory}
          className="pixel-btn w-full sm:w-auto bg-[#D4A44A] hover:bg-[#E0B35B] text-[#2B2B2B] font-semibold text-base px-4 min-h-[48px] flex items-center justify-center gap-2 cursor-pointer shrink-0"
        >
          <ArrowLeft className="w-4 h-4 shrink-0" />
          <span>Explore Story Mode</span>
        </button>
      </section>

      {/* About Me */}
      <section className="pixel-panel p-5 sm:p-7 space-y-4" aria-labelledby="qp-about">
        <h2 id="qp-about" className="font-pixel text-xs sm:text-sm text-[#C17A5A]">
          ABOUT ME
        </h2>
        <p className="text-base text-[#2B2B2B] leading-relaxed">
          {CONTENT.academy.bio}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t-2 border-dashed border-[#D3C4A8]">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-[#56694A] mb-1.5">
              Journey
            </h3>
            <p className="text-base text-[#3D372E] leading-relaxed">
              {CONTENT.academy.journey}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wide text-[#56694A] mb-1.5">
              Core Interests
            </h3>
            <ul className="space-y-1 text-base text-[#3D372E]">
              {CONTENT.academy.interests.map((interest) => (
                <li key={interest}>· {interest}</li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="space-y-5" aria-labelledby="qp-projects">
        <h2
          id="qp-projects"
          className="font-pixel text-xs sm:text-sm text-[#F2E8D5] tracking-wide px-1"
        >
          SELECTED PROJECTS
        </h2>

        <div className="space-y-5">
          {CONTENT.quests.items.map((project) => {
            const hasLiveUrl = Boolean(project.liveUrl && project.liveUrl.trim());
            const hasGithubUrl = Boolean(project.githubUrl && project.githubUrl.trim());
            const isComingSoon = project.status === 'COMING SOON';

            return (
              <article key={project.id} className="pixel-panel p-5 sm:p-6 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-pixel text-[10px] text-[#C17A5A]">
                    {project.questCode} · {project.environmentLabel}
                  </span>

                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded border-2 font-pixel text-[8px] sm:text-[9px] ${
                      hasLiveUrl || hasGithubUrl
                        ? 'bg-[#6B7F5E] text-[#F2E8D5] border-[#2B2B2B]'
                        : 'bg-[#2B2B2B] text-[#D4A44A] border-[#2B2B2B]'
                    }`}
                  >
                    {isComingSoon ? (
                      <Clock className="w-3 h-3 shrink-0" aria-hidden="true" />
                    ) : (
                      <Hammer className="w-3 h-3 shrink-0" aria-hidden="true" />
                    )}
                    <span>{project.status}</span>
                  </span>
                </div>

                <QuestEnvironmentArt variant={project.environment} />

                <div className="space-y-2.5">
                  <h3 className="text-xl font-bold text-[#2B2B2B]">{project.title}</h3>
                  <p className="text-base text-[#3D372E] leading-relaxed">
                    {project.description}
                  </p>
                  <p className="text-sm font-semibold text-[#56694A]">
                    {project.technologies.join(' · ')}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-base">
                    <div className="p-3 rounded-lg bg-[#E9DEC7] border border-[#CBBBA0]">
                      <p className="text-xs font-bold uppercase tracking-wide text-[#C17A5A] mb-1">
                        Problem Solved
                      </p>
                      <p className="text-sm sm:text-base text-[#2B2B2B]">
                        {project.problemSolved}
                      </p>
                    </div>
                    <div className="p-3 rounded-lg bg-[#E9DEC7] border border-[#CBBBA0]">
                      <p className="text-xs font-bold uppercase tracking-wide text-[#56694A] mb-1">
                        My Contribution
                      </p>
                      <p className="text-sm sm:text-base text-[#2B2B2B]">
                        {project.contribution}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row flex-wrap gap-3 pt-1">
                  {hasLiveUrl && project.liveUrl && (
                    <a
                      href={project.liveUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => onPlaySfx?.('openProject')}
                      className="pixel-btn bg-[#6B7F5E] hover:bg-[#5E7152] text-[#F2E8D5] font-pixel text-[10px] px-5 min-h-[48px] flex items-center justify-center gap-2"
                    >
                      <span>LIVE DEMO</span>
                      <ExternalLink className="w-4 h-4 shrink-0" />
                    </a>
                  )}

                  {hasGithubUrl && project.githubUrl && (
                    <a
                      href={project.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => onPlaySfx?.('openProject')}
                      className="pixel-btn bg-[#2B2B2B] hover:bg-[#3A3A3A] text-[#F2E8D5] font-pixel text-[10px] px-5 min-h-[48px] flex items-center justify-center gap-2"
                    >
                      <Github className="w-4 h-4 shrink-0" />
                      <span>VIEW SOURCE</span>
                    </a>
                  )}

                  {!hasLiveUrl && !hasGithubUrl && (
                    <div className="w-full sm:w-auto min-h-[48px] px-4 rounded-lg border-2 border-dashed border-[#C17A5A] bg-[#E9DEC7] text-[#5A4B3C] font-pixel text-[9px] sm:text-[10px] flex items-center justify-center gap-2 select-none">
                      {isComingSoon ? (
                        <Clock className="w-4 h-4 text-[#C17A5A] shrink-0" aria-hidden="true" />
                      ) : (
                        <Hammer className="w-4 h-4 text-[#C17A5A] shrink-0" aria-hidden="true" />
                      )}
                      <span>{project.status} · PUBLIC DEMO &amp; SOURCE COMING SOON</span>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </section>

      {/* Skills */}
      <section className="pixel-panel p-5 sm:p-7 space-y-4" aria-labelledby="qp-skills">
        <h2 id="qp-skills" className="font-pixel text-xs sm:text-sm text-[#C17A5A]">
          TECHNICAL SKILLS
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {CONTENT.spellbook.skills.map((skill) => (
            <div
              key={skill.id}
              className="p-3.5 rounded-lg bg-[#FFF9ED] border-2 border-[#2B2B2B] flex items-start gap-3"
            >
              <SkillArtifactSprite
                icon={skill.icon}
                collected
                className="w-8 h-8 shrink-0 mt-0.5"
              />
              <div>
                <h3 className="text-base font-bold text-[#2B2B2B]">{skill.name}</h3>
                <p className="text-sm text-[#4A4338] leading-snug mt-0.5">
                  {skill.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Optional Experiments */}
      {CONTENT.alchemy.enabled && (
        <section className="pixel-panel p-5 sm:p-7 space-y-4" aria-labelledby="qp-lab">
          <h2 id="qp-lab" className="font-pixel text-xs sm:text-sm text-[#C17A5A]">
            ENGINEERING EXPERIMENTS
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CONTENT.alchemy.experiments.map((exp) => (
              <div
                key={exp.id}
                className="p-3.5 rounded-lg bg-[#E9DEC7] border-2 border-[#2B2B2B] space-y-1.5"
              >
                <h3 className="text-base font-bold text-[#2B2B2B]">{exp.title}</h3>
                <p className="text-sm text-[#3D372E]">{exp.summary}</p>
                <p className="text-xs font-semibold text-[#56694A]">
                  {exp.tags.join(' · ')}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Contact */}
      <section className="pixel-panel p-5 sm:p-7 space-y-4" aria-labelledby="qp-contact">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg bg-[#2B2B2B] border-2 border-[#D4A44A] flex items-center justify-center shrink-0">
            <PixelMessengerOwl className="w-10 h-10" />
          </div>
          <div>
            <h2 id="qp-contact" className="font-pixel text-xs sm:text-sm text-[#C17A5A]">
              OWL POST · CONTACT
            </h2>
            <p className="text-base text-[#3D372E] mt-0.5">{CONTENT.owlPost.subtitle}</p>
          </div>
        </div>
        <div className="flex flex-col sm:flex-row gap-2.5">
          <a
            href={`mailto:${CONTENT.owlPost.email}`}
            className="pixel-btn flex-1 bg-[#C17A5A] hover:bg-[#B26B4C] text-[#F2E8D5] font-semibold text-base px-4 min-h-[48px] flex items-center justify-center gap-2"
          >
            <Mail className="w-4 h-4 shrink-0" />
            <span className="truncate">{CONTENT.owlPost.email}</span>
          </a>
          <button
            type="button"
            onClick={onCopyEmail}
            className="pixel-btn bg-[#E9DEC7] hover:bg-[#DFD0B2] text-[#2B2B2B] font-semibold text-base px-4 min-h-[48px] flex items-center justify-center gap-2 cursor-pointer"
          >
            {emailCopied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{emailCopied ? 'Copied' : 'Copy Email'}</span>
          </button>
        </div>
        <div>
          <a
            href={CONTENT.owlPost.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="pixel-btn w-full bg-[#2B2B2B] hover:bg-[#3A3A3A] text-[#F2E8D5] font-semibold text-base px-4 min-h-[48px] flex items-center justify-center gap-2"
          >
            <Github className="w-4 h-4 shrink-0" />
            <span className="truncate">
              GitHub · {CONTENT.owlPost.githubUrl.replace(/^https?:\/\//, '')}
            </span>
          </a>
        </div>
      </section>
    </div>
  );
}

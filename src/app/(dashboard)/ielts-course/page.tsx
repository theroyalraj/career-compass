import fs from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export default async function IELTSCoursePage() {
  let downloadedVideos: string[] = [];
  try {
    const videosPath = path.join(process.cwd(), 'public', 'ms_smc_videos');
    if (fs.existsSync(videosPath)) {
      downloadedVideos = fs.readdirSync(videosPath).filter(file => 
        file.endsWith('.mp4') || file.endsWith('.mkv') || file.endsWith('.webm')
      );
    }
  } catch (e) {
    console.error("Error reading videos directory:", e);
  }

  const isDownloading = downloadedVideos.length > 0 && downloadedVideos.length < 63;

  return (
    <div className="space-y-8 pb-12">
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-primary/20 via-card to-card p-8 shadow-2xl">
        <div className="relative">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-primary animate-pulse">
            Highest Priority Active Task
          </p>
          <h2 className="mt-2 max-w-2xl text-3xl font-bold tracking-tight md:text-4xl">
            IELTS Full Course - 2023
          </h2>
          <p className="mt-3 max-w-xl text-sm text-muted-foreground md:text-base">
            This 63-video course covers all aspects of the IELTS exam (Listening, Reading, Writing, Speaking). 
            Completing this is a critical step towards your MS in Sound and Music AI dream at UPF Barcelona.
          </p>
          <div className="mt-6 flex flex-wrap gap-4">
            <a 
              href="https://www.youtube.com/playlist?list=PLfSUFKdFlttn1MWrG5Q0-a9Cbm9y3uulX" 
              target="_blank" 
              rel="noreferrer"
              className="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 transition-colors"
            >
              Watch on YouTube
            </a>
            <div className="inline-flex items-center justify-center rounded-md border border-white/10 bg-white/5 px-6 py-2.5 text-sm font-medium text-foreground shadow">
              {isDownloading ? (
                <><span className="mr-2 animate-spin">⏳</span> Download in progress ({downloadedVideos.length}/63 downloaded)</>
              ) : downloadedVideos.length >= 63 ? (
                <><span className="mr-2 text-green-500">✓</span> All 63 Videos Downloaded</>
              ) : (
                <><span className="mr-2">📺</span> Available on YouTube</>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="glass-card p-6">
        <h3 className="text-xl font-bold mb-4">Course Summary</h3>
        <p className="text-muted-foreground text-sm leading-relaxed mb-4">
          The IELTS Full Course - 2023 playlist provides a comprehensive preparation strategy for achieving a high band score, which is mandatory for your UPF Barcelona application. It breaks down the four core modules:
        </p>
        <ul className="space-y-3 text-sm text-muted-foreground list-disc pl-5">
          <li><strong>Listening:</strong> Strategies for understanding diverse accents, predicting answers, and avoiding common traps under exam conditions.</li>
          <li><strong>Reading:</strong> Skimming and scanning techniques to quickly locate information, understand complex texts, and manage time effectively.</li>
          <li><strong>Writing (Task 1 & 2):</strong> Structuring academic essays, analyzing graphs/charts (for Task 1), and building advanced vocabulary and grammar structures.</li>
          <li><strong>Speaking:</strong> Tips for fluency, pronunciation, and developing extended, coherent, and well-structured responses across all three parts of the interview.</li>
        </ul>
        <div className="mt-8 p-5 rounded-xl bg-primary/10 border border-primary/30 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10 text-4xl">🚀</div>
          <p className="text-sm font-bold text-primary relative z-10">
            Directive: Dedicate at least 1 hour daily to this course. Complete all 63 videos and take full practice tests before booking your IELTS exam. Your MS dream depends on it.
          </p>
        </div>
      </div>

      {downloadedVideos.length > 0 && (
        <div className="glass-card p-6 mt-8">
          <h3 className="text-xl font-bold mb-4">Downloaded Local Videos</h3>
          <p className="text-sm text-muted-foreground mb-4">These videos have been downloaded to your machine for offline viewing. Click to open them.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[500px] overflow-y-auto pr-2">
            {downloadedVideos.map(video => (
              <a 
                key={video}
                href={`/ms_smc_videos/${encodeURIComponent(video)}`}
                target="_blank"
                className="flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-colors"
              >
                <span className="text-2xl">🎬</span>
                <span className="text-sm font-medium truncate" title={video}>{video.replace(/\.[^/.]+$/, "")}</span>
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import PageLayout from "../components/layout/PageLayout.jsx";
import Card, { CardHeader } from "../components/ui/Card.jsx";
import Loading from "../components/common/Loading.jsx";
import ErrorState from "../components/common/ErrorState.jsx";
import RepositoryCard from "../features/git/components/RepositoryCard.jsx";
import CommitList from "../features/git/components/CommitList.jsx";
import ConflictAlert from "../features/git/components/ConflictAlert.jsx";
import { getConflictRadar, getRecentCommits, getRepository, syncRepository } from "../services/git.api.js";
import "./Git.css";

export default function Git() {
  const [repo, setRepo] = useState(null);
  const [commits, setCommits] = useState([]);
  const [conflicts, setConflicts] = useState([]);
  const [status, setStatus] = useState("loading");
  const [isSyncing, setIsSyncing] = useState(false);

  const load = () => {
    setStatus("loading");
    Promise.all([getRepository("neurahack-2026"), getRecentCommits("neurahack-2026"), getConflictRadar("neurahack-2026")])
      .then(([r, c, cf]) => {
        setRepo(r);
        setCommits(c);
        setConflicts(cf);
        setStatus("ready");
      })
      .catch(() => setStatus("error"));
  };

  useEffect(load, []);

  const handleSync = async () => {
    setIsSyncing(true);
    try {
      await syncRepository("neurahack-2026");
      load();
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <PageLayout
      navbarContent={
        <div>
          <h1 className="page-title">Repository — {repo?.name || "…"}</h1>
          <p className="page-subtitle">{repo ? `Last synced ${repo.lastSynced}` : "Loading repository details…"}</p>
        </div>
      }
    >
      <div className="page">
        {status === "loading" && <Loading />}
        {status === "error" && <ErrorState onRetry={load} />}

        {status === "ready" && (
          <>
            <RepositoryCard repo={repo} onSync={handleSync} isSyncing={isSyncing} />

            <div className="git-stats">
              <Card className="git-stat">
                <p className="git-stat-value">{repo.branchCount}</p>
                <p className="text-muted">Branches</p>
              </Card>
              <Card className="git-stat">
                <p className="git-stat-value">{repo.openPRs}</p>
                <p className="text-muted">Open PRs</p>
              </Card>
              <Card className="git-stat git-stat-danger">
                <p className="git-stat-value">{repo.potentialConflicts}</p>
                <p className="text-muted">Potential Conflicts</p>
              </Card>
            </div>

            <div className="git-columns">
              <Card>
                <CardHeader title="Recent Commits" />
                <CommitList commits={commits} />
              </Card>

              <Card>
                <CardHeader title="Conflict Radar" subtitle={`${conflicts.length} potential overlaps`} />
                <div>
                  {conflicts.map((conflict) => (
                    <ConflictAlert key={conflict.id} conflict={conflict} />
                  ))}
                </div>
              </Card>
            </div>
          </>
        )}
      </div>
    </PageLayout>
  );
}

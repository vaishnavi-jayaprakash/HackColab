import EmptyState from "../../../components/common/EmptyState.jsx";
import "./CommitList.css";

export default function CommitList({ commits }) {
  if (!commits.length) return <EmptyState title="No recent commits" />;

  return (
    <ul className="commit-list">
      {commits.map((commit) => (
        <li key={commit.id} className="commit-row">
          <span className="commit-avatar">{commit.initials}</span>
          <div className="commit-body">
            <p className="commit-author">{commit.author}</p>
            <p className="commit-message">{commit.message}</p>
          </div>
          <span className="commit-time">{commit.timestamp}</span>
        </li>
      ))}
    </ul>
  );
}

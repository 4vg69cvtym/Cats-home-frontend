import './Landing.css';

function Landing({ onEnter }) {
  return (
    <div className="landing">
      <div className="landing-content">
        <div className="landing-icon">🐱</div>
        <h1 className="landing-title">Cats Home</h1>
        <p className="landing-sub">Black cat is waiting for you ❤️</p >
        <button className="landing-btn" onClick={onEnter}>
          进入
        </button>
      </div>
    </div>
  );
}

export default Landing;

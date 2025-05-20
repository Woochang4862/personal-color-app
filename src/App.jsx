import { HashRouter, Routes, Route } from 'react-router-dom';
import './App.css';
import LandingPage from './pages/LandingPage';
import CapturePage from './pages/CapturePage';
import ResultPage from './pages/ResultPage';

// 레이아웃 컴포넌트
const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-secondary">
      <header className="border-b border-white/10 py-4 px-4 sm:px-6 lg:px-8 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <a href="/" className="flex items-center hover:opacity-90 transition-opacity">
            <h1 className="text-3xl font-bold tracking-wider" style={{ color: '#E67E22' }}>MARS</h1>
          </a>
          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              <li><a href="/" className="text-white hover:text-primary transition-colors">홈</a></li>
              <li><a href="/#/capture" className="text-white hover:text-primary transition-colors">진단하기</a></li>
              <li><a href="/#about" className="text-white hover:text-primary transition-colors">소개</a></li>
            </ul>
          </nav>
        </div>
      </header>
      <main className="flex-grow">
        <Routes>
          <Route index element={<LandingPage />} />
          <Route path="capture" element={
            <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto w-full">
              <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-6">
                <CapturePage />
              </div>
            </div>
          } />
          <Route path="result" element={
            <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto w-full">
              <div className="bg-black/30 backdrop-blur-md rounded-2xl border border-white/10 shadow-2xl p-6">
                <ResultPage />
              </div>
            </div>
          } />
        </Routes>
      </main>
      <footer className="border-t border-white/10 mt-auto py-6 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white/70">
          <p className="mb-2">© 2025 퍼스널 컬러 진단 서비스</p>
          <div className="flex justify-center space-x-4 mt-2">
            <a href="#" className="text-white/70 hover:text-primary">이용약관</a>
            <a href="#" className="text-white/70 hover:text-primary">개인정보처리방침</a>
            <a href="#" className="text-white/70 hover:text-primary">문의하기</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/*" element={<Layout />} />
      </Routes>
    </HashRouter>
  );
}

export default App;

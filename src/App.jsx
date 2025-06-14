import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import './App.css';
import LandingPage from './pages/LandingPage';
import CapturePage from './pages/CapturePage';
import ResultPage from './pages/ResultPage';
import MemoryPage from './pages/MemoryPage';
import logo from './assets/mars_logo.png';

// 레이아웃 컴포넌트
const Layout = () => {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';

  // 라우트 변경 시 스크롤을 상단으로 이동
  useEffect(() => {
    // 랜딩페이지가 아닌 경우에만 스크롤 초기화
    if (!isLandingPage) {
      const mainElement = document.getElementsByTagName("main")[0];
      if (mainElement) {
        mainElement.scrollTo(0, 0);
      }
    }
  }, [location.pathname, isLandingPage]);

  return (
    <div className="h-screen flex flex-col bg-[#353535]">
      <header className="fixed top-0 left-0 w-full z-50 border-b border-gray-200 py-4 px-4 sm:px-6 lg:px-8 bg-[#353535]">
        <div className="max-w-14xl mx-auto flex items-center justify-between">
          <a href="/personal-color-app/#/" className="flex items-center hover:opacity-90 transition-opacity">
            <img src={logo} alt="logo" className="h-10" />
          </a>
          <nav className="hidden md:block">
            <ul className="flex space-x-8">
              <li><a href="/personal-color-app/#/" className="tracking-tight text-white hover:text-primary transition-colors">home</a></li>
              <li><a href="/personal-color-app/#/capture" className="tracking-tight text-white hover:text-primary transition-colors">contract</a></li>
            </ul>
          </nav>
        </div>
      </header>
      <main className={`flex-1 pt-20 ${isLandingPage ? 'overflow-y-auto snap-y snap-mandatory' : 'overflow-y-auto'}`}>
        <Routes>
          <Route index element={<LandingPage />} />
          <Route path="capture" element={
            <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto w-full">
              <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
                <CapturePage />
              </div>
            </div>
          } />
          <Route path="result" element={
            <div className="px-4 sm:px-6 lg:px-8 py-10 max-w-7xl mx-auto w-full">
              <div className="bg-white p-6">
                <ResultPage />
              </div>
            </div>
          } />
          <Route path="memory" element={<MemoryPage />} />
        </Routes>
      </main>
      {/* <footer className="border-t border-gray-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p className="mb-2">© 2025 퍼스널 컬러 진단 서비스</p>
          <div className="flex justify-center space-x-4 mt-2">
            <a href="#" className="text-gray-600 hover:text-primary">이용약관</a>
            <a href="#" className="text-gray-600 hover:text-primary">개인정보처리방침</a>
            <a href="#" className="text-gray-600 hover:text-primary">문의하기</a>
          </div>
        </div>
      </footer> */}
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

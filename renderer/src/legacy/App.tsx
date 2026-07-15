import React from 'react';
import { Outlet } from 'react-router-dom';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import HeadBar from './common/HeadBar';
import NavBar from './common/NavBar';
import SideBar from './sidebars/SideBar';
import History from './pages/History/History';
import Sessions from './pages/Sessions/Sessions';
import Requests from './pages/Requests/Requests';
import Chat from './pages/Chat/Chat';
import { palette } from './theme';

// 顶栏高度，集中定义，避免布局高度计算与实际高度不一致（之前 HeadBar 为
// 60px，主区却用 calc(100vh - 50px)，导致内容溢出 10px）。
const HEAD_BAR_HEIGHT = 60;

const PageContainer = styled.div`
  background-color: ${palette.bg};
  color: ${palette.text};
  width: 100%;
  height: 100vh;
  overflow: hidden;
`;

const MainContainer = styled.div`
  display: flex;
  flex-direction: row;
  height: calc(100vh - ${HEAD_BAR_HEIGHT}px);
`;

const OutletContainer = styled.div`
  background-color: ${palette.bg};
  width: 100%;
  overflow: auto;
`;

interface LayoutProps {
  page: string;
}

// The overall page layout.
// 定义在 App 外部，避免每次 App 重渲染都重建组件、导致子树卸载重挂。
const Layout: React.FC<LayoutProps> = (props) => {
  return (
    <PageContainer>
      <HeadBar />
      <MainContainer>
        <NavBar page={props.page} />
        <SideBar page={props.page} />
        <OutletContainer>
          <Outlet />
        </OutletContainer>
      </MainContainer>
    </PageContainer>
  );
};

const App: React.FC = () => {
  // Define react router rules.
  // Note that request page is nested in session page, so session page component
  // will not unmount when navigating to a request page.
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Navigate replace to={'/sessions/'} />} />

          <Route path="/sessions" element={<Layout page="sessions" />}>
            <Route path="" element={<Sessions />} />
            <Route path=":id" element={<Sessions />}>
              <Route path=":requestId" element={<Requests />} />
            </Route>
          </Route>

          <Route path="/history" element={<Layout page="history" />}>
            <Route path="" element={<History />} />
            <Route path=":id" element={<History />} />
          </Route>

          <Route path="/chat" element={<Layout page="chat" />}>
            <Route path="" element={<Chat />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
};

export default App;

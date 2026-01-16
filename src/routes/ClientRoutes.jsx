import { Route } from 'react-router-dom';
import { lazy, Suspense } from 'react';
import Loader from '../components/Loader';
import AllCampus from '../client/components/allCampus/AllCampus';

// Lazy layouts & pages
const Client = lazy(() => import('../client/Client'));
const Home = lazy(() => import('../client/components/home/Home'));
const Login = lazy(() => import('../client/components/login/Login'));
const NewCampus = lazy(() =>
  import('../client/components/newCampus/NewCampus')
);

export const clientRoutes = (
  
    <Route
      path="/"
      element={
        <Suspense fallback={<Loader />}>
          <Client />
        </Suspense>
      }
    >
      <Route
        index
        element={
          <Suspense fallback={<Loader />}>
            <Home />
          </Suspense>
        }
      />
      <Route
        path="login"
        element={
          <Suspense fallback={<Loader />}>
            <Login />
          </Suspense>
        }
      />
      <Route
        path="newcampus"
        element={
          <Suspense fallback={<Loader />}>
            <NewCampus />
          </Suspense>
        }
      />
       <Route
        path="allcampus"
        element={
          <Suspense fallback={<Loader />}>
            <AllCampus />
          </Suspense>
        }
      />
    </Route>
  
); 

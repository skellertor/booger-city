import { ThemeProvider } from '@nerdcoresdk/nerd-core-ui';
import { AuthProvider } from '../components/AuthProvider';
import { ProtectedRoute } from '../components/Routes/ProtectedRoute';
import { StrictlyPublicRoute } from '../components/Routes/StrictlyPublicRoute';
import { EnrollmentRoute } from '../components/Routes/EnrollmentRoute';
import { Layout } from '../components/Layout/Layout';

import '@nerdcoresdk/nerd-core-ui/dist/main.css';

import { theme } from '../theme/theme';
import './_app.css';

function Protector({ Component, pageProps }) {
  const { enrollmentRoute, protectedRoute, strictlyPublicRoute } = Component;
  if (enrollmentRoute) {
    return (
      <EnrollmentRoute>
        <Component {...pageProps} />
      </EnrollmentRoute>
    );
  } else if (protectedRoute) {
    return (
      <ProtectedRoute>
        <Component {...pageProps} />
      </ProtectedRoute>
    );
  } else if (strictlyPublicRoute) {
    return (
      <StrictlyPublicRoute>
        <Component {...pageProps} />
      </StrictlyPublicRoute>
    );
  } else {
    return <Component {...pageProps} />;
  }
}

function App({ Component, pageProps }) {
  return (
    <AuthProvider>
      <ThemeProvider theme={theme}>
        <Layout>
          <Protector Component={Component} pageProps={pageProps} />
        </Layout>
      </ThemeProvider>
    </AuthProvider>
  );
}

export default App;

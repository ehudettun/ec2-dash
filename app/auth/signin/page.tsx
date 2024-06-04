'use client';

import { signIn } from 'next-auth/react';
import { useState } from 'react';
import {
  Container,
  TextField,
  Button,
  Typography,
  Box
} from '@mui/material';

const SignIn: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const result = await signIn('credentials', {
    callbackUrl: "/",
    redirect: false,
      email,
      password,
    });

    if (result?.error) {
      setError(result.error);
    }
  };

  return (
    <Container maxWidth="sm">
      <Box mt={8} display="flex" flexDirection="column" alignItems="center">
        <Typography variant="h4" component="h1" gutterBottom>
          Sign In
        </Typography>
        <form onSubmit={handleSubmit} style={{ width: '100%', marginTop: '1rem' }}>
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            id="email"
            label="Email Address"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <TextField
            variant="outlined"
            margin="normal"
            required
            fullWidth
            name="password"
            label="Password"
            type="password"
            id="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {error && <Typography color="error">{error}</Typography>}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            color="primary"
          >
            Sign In
          </Button>
        </form>
      </Box>
    </Container>
  );
};

export default SignIn;

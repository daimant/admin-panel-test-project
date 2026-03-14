import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import {
  Box,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Typography,
  Paper,
  Alert,
} from "@mui/material";
import { useAuth } from "../context/AuthContext";
import { useSnackbar } from "notistack";
import { getCurrentUser } from "../api/auth";

const schema = yup
  .object({
    username: yup.string().required("Username is required"),
    password: yup.string().required("Password is required"),
    remember: yup.boolean().optional(),
  })
  .required();

type FormValues = yup.InferType<typeof schema>;

async function wait(ms: number) {
  return new Promise((res) => setTimeout(res, ms));
}

export default function LoginPage(): JSX.Element {
  const navigate = useNavigate();
  const { login, isLoading, token, user } = useAuth();
  const { enqueueSnackbar } = useSnackbar();
  const justLoggedInRef = useRef(false);

  useEffect(() => {
    if (!isLoading && (token || user)) {
      try {
        justLoggedInRef.current = false;
      } catch {}
      navigate("/products");
      return;
    }

    if (justLoggedInRef.current && !isLoading && (token || user)) {
      justLoggedInRef.current = false;
      navigate("/products");
    }
  }, [isLoading, token, user, navigate]);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { username: "", password: "", remember: false },
  });

  const [serverError, setServerError] = useState<string | null>(null);

  async function tryResolveUser(retries = 8, interval = 250) {
    for (let i = 0; i < retries; i++) {
      try {
        const me = await getCurrentUser();
        if (me) return me;
      } catch (err) {
        try {
          console.debug(
            `[LoginPage] getCurrentUser retry ${i + 1} failed:`,
            err,
          );
        } catch {}
      }
      await wait(interval);
    }
    return null;
  }

  async function onSubmit(data: FormValues) {
    setServerError(null);
    try {
      try {
        console.debug("[LoginPage] attempting login", {
          username: data.username,
          remember: data.remember,
        });
      } catch {}

      try {
        justLoggedInRef.current = true;
      } catch {}

      const res = await login(
        data.username,
        data.password,
        Boolean(data.remember),
      );

      try {
        console.debug("[LoginPage] login result:", res);
      } catch {}

      if (res) {
        try {
          console.debug(
            "[LoginPage] authentication successful, navigating to /products",
          );
        } catch {}
        navigate("/products");
        return;
      }

      const me = await tryResolveUser();
      if (me) {
        try {
          console.debug(
            "[LoginPage] getCurrentUser succeeded after login, navigating to /products",
            me,
          );
        } catch {}
        navigate("/products");
        return;
      }

      const message = "Authentication failed: no token or user returned";
      setServerError(message);
      enqueueSnackbar(message, { variant: "error" });
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Login failed. Please check your credentials.";
      setServerError(message);
      setError("username", {
        type: "server",
        message: "Invalid credentials",
      });
      enqueueSnackbar(message, { variant: "error" });
      try {
        console.debug("[LoginPage] login error:", err);
      } catch {}
    }
  }

  const disabled = isSubmitting || isLoading;

  return (
    <Box className="login-container" component={Paper} elevation={2}>
      <Typography variant="h5" component="h1" gutterBottom>
        Sign in
      </Typography>

      {serverError && (
        <Box mb={2}>
          <Alert severity="error" data-testid="server-error">
            {serverError}
          </Alert>
        </Box>
      )}

      <form onSubmit={handleSubmit(onSubmit)} noValidate>
        <TextField
          label="Username"
          fullWidth
          margin="normal"
          autoComplete="username"
          autoFocus
          {...register("username")}
          error={Boolean(errors.username)}
          helperText={errors.username?.message}
          inputProps={{ "aria-label": "username" }}
        />

        <TextField
          label="Password"
          fullWidth
          margin="normal"
          type="password"
          autoComplete="current-password"
          {...register("password")}
          error={Boolean(errors.password)}
          helperText={errors.password?.message}
          inputProps={{ "aria-label": "password" }}
        />

        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          mt={1}
        >
          <FormControlLabel
            control={<Checkbox {...register("remember")} color="primary" />}
            label="Remember me"
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={disabled}
            aria-label="login-button"
          >
            {disabled ? "Signing in..." : "Login"}
          </Button>
        </Box>
      </form>

      <Box mt={3} className="text-muted">
        <Typography variant="body2">
          Use credentials from the demo API (e.g. a user from
          dummyjson.com/users). If authentication fails, the error will be shown
          above.
        </Typography>
      </Box>
    </Box>
  );
}

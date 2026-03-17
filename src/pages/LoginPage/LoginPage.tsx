import "./LoginPage.scss";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { Box, TextField, Button, Checkbox, FormControlLabel, Typography, Alert, Link } from "@mui/material";
import { useAuth } from "@/context/AuthContext";
import { useSnackbar } from "notistack";
import { getCurrentUser } from "@/api/auth";
import LogoIcon from "@/assets/icons/LogoIcon.svg";
import PersonIcon from "@/assets/icons/PersonIcon.svg";
import CrossIcon from "@/assets/icons/CrossIcon.svg";
import LockIcon from "@/assets/icons/LockIcon.svg";
import EyeIcon from "@/assets/icons/EyeIcon.svg";


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

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setError,
    setValue,
  } = useForm<FormValues>({
    resolver: yupResolver(schema),
    defaultValues: { username: "", password: "", remember: false },
  });

  const [serverError, setServerError] = useState<string | null>(null);
  const [passwordInputType, setPasswordInputType] = useState<string>('password');

  useEffect(() => {
    if (!isLoading && (token || user)) {
      justLoggedInRef.current = false;
      navigate("/products");
      return;
    }

    if (justLoggedInRef.current && !isLoading && (token || user)) {
      justLoggedInRef.current = false;
      navigate("/products");
    }
  }, [isLoading, token, user, navigate]);

  const disabled = isSubmitting || isLoading;

  async function tryResolveUser(retries = 8, interval = 250) {
    for (let i = 0; i < retries; i++) {
      try {
        const me = await getCurrentUser();
        if (me) return me;
      } catch (err) {
        console.debug(`[LoginPage] getCurrentUser retry ${i + 1} failed:`, err);
      }

      await wait(interval);
    }
    return null;
  }

  async function onSubmit(data: FormValues) {
    setServerError(null);

    try {
      justLoggedInRef.current = true;
      const res = await login(data.username, data.password, Boolean(data.remember),);

      if (res) {
        navigate("/products");
        return;
      }

      const me = await tryResolveUser();
      if (me) {
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
      console.debug("[LoginPage] login error:", err);
    }
  }

  function clearUserInput() {
    setValue("username", "");
  }

  function setPasswordInputTypeHandler() {
    if (passwordInputType === "password") setPasswordInputType('text')
    else setPasswordInputType('password');
  }

  return (
    <section className="login-container">
      <div className="login-inner">
        <Box className='logo-container'>
          <img src={LogoIcon} alt="Logo" width={68} height={74}/>
        </Box>

        <Box className='flex-column'>
          <Typography component='h1' className='title'>
            Добро пожаловать!
          </Typography>
          <Typography component='p' className='description linear-gray-color'>
            Пожалуйста, авторизируйтесь
          </Typography>
        </Box>

        {serverError && (
          <Alert severity="error" data-testid="server-error">
            {serverError}
          </Alert>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate className='login-form'>
          <Box className='login-form-input-container'>
            <Typography className='login-form-input-label' component='label'>
              Логин
            </Typography>
            <TextField
              fullWidth
              className='login-form-input'
              autoComplete="username"
              autoFocus
              {...register("username")}
              error={Boolean(errors.username)}
              helperText={errors.username?.message}
              InputProps={{
                "aria-label": "username",
                startAdornment: <img src={PersonIcon} alt="person"/>,
                endAdornment: <img src={CrossIcon} alt="cross" className='pointer' onClick={clearUserInput}/>,
              }}
            />
          </Box>

          <Box className='login-form-input-container'>
            <Typography className='login-form-input-label' component='label'>
              Пароль
            </Typography>
            <TextField
              fullWidth
              className='login-form-input'
              type={passwordInputType}
              autoComplete="current-password"
              {...register("password")}
              error={Boolean(errors.password)}
              helperText={errors.password?.message}
              InputProps={{
                "aria-label": "password",
                startAdornment: <img src={LockIcon} alt="person"/>,
                endAdornment: <img src={EyeIcon} alt="x" className='pointer' onClick={setPasswordInputTypeHandler}/>,
              }}
            />
          </Box>

          <FormControlLabel
            className='login-form-remember-me-block'
            control={<Checkbox {...register("remember")} color="primary"/>}
            label="Запомнить данные"
          />

          <Button
            className='login-form-submit-button'
            type="submit"
            variant="contained"
            color="primary"
            disabled={disabled}
            aria-label="login-button"
          >
            Войти
          </Button>

          <Box className='login-form-or linear-gray-color'>
            <Typography component='p'>или</Typography>
          </Box>
        </form>

        <Box className='login-form-create-account'>
          <Typography component='label'>Нет аккаунта?</Typography>
          <Link href='https://dummyjson.com' target='_blank'>Создать</Link>
        </Box>
      </div>
    </section>
  );
}

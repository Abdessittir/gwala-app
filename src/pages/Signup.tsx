import { useState } from 'react';
import Input from '../components/Input';
import { Link } from 'react-router-dom';
import { useUnauthEffect } from '../hooks/useAuth';
import request from '../request';
import { useDispatch } from '../context';
import { SET_ALERT, SET_PROFILE } from '../context/actions';
import styles from '../styles/Form.module.css';

type SignupStateType = {
  email: string,
  password: string,
};

const Signup = () => {
  useUnauthEffect();

  const [state, setState] = useState<SignupStateType>({
    email: '',
    password: '',
  });
  const dispatch = useDispatch();

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setState(prev => ({
      ...prev,
      [event.target.name]: event.target.value
    }));
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!state.email || !state.password) return;

    const response = await request('/api/v1/auth/signup', {
      method: 'post',
      body: JSON.stringify(state),
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.success) {
      dispatch({ type: SET_PROFILE, payload: response.data.user });
    } else {
      dispatch({ type: SET_ALERT, payload: { type: 'error', message: response.error } });
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h1>Sign Up</h1>
      <Input
        label="Email"
        options={{
          id: 'signup_email',
          type: 'email',
          name: 'email',
          placeholder: 'Type your email',
          value: state.email,
          onChange: handleChange,
          required: true,
        }}
      />
      <Input
        label="Password"
        options={{
          id: 'signup_password',
          type: 'password',
          name: 'password',
          placeholder: 'Type your password',
          value: state.password,
          onChange: handleChange,
          required: true,
        }}
      />
      <button type='submit'>Sing up</button>
      <Link className={styles.link} to='/signin'>signin</Link>
    </form>
  );
};

export default Signup;

import './App.css';
import { useState, useEffect } from 'react';
import { useNavigate, BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import axios from 'axios';

function Main() {
  return (
    <>
      <h2>마이페이지</h2>
      <Link to="/login">로그인</Link>
    </>
  );
}

function Login(props) {
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  
  return <>
    <h2>로그인</h2>

    <div className="form">
      <p><input className="login" type="text" name="username" placeholder="아이디" onChange={event => {
        setId(event.target.value);
      }} /></p>
      <p><input className="login" type="password" name="pwd" placeholder="비밀번호" onChange={event => {
        setPassword(event.target.value);
      }} /></p>

      <p><input className="btn" type="submit" value="로그인" onClick={() => {
        const userData = {
          userId: id,
          userPassword: password,
        };
        axios.post("http://localhost:3001/login", userData)
          .then((response) => {
            console.log("data: ", response.data);
            const json = response.data;       
            if(json.isLogin==="True"){
              navigate('/welcome');
            }
            else {
              alert(json.isLogin)
            }
          })
          .catch((error) => {
            console.error("Axios POST request error: ", error);
          });
      }} /></p>
    </div>

    <p>계정이 없으신가요?  <button onClick={() => {
      navigate('/signin');
    }}>회원가입</button></p>
  </> 
}


function Signin(props) {
  const navigate = useNavigate();
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  return <>
    <h2>회원가입</h2>

    <div className="form">
      <p><input className="login" type="text" placeholder="아이디" onChange={event => {
        setId(event.target.value);
      }} /></p>
      <p><input className="login" type="password" placeholder="비밀번호" onChange={event => {
        setPassword(event.target.value);
      }} /></p>
      <p><input className="login" type="password" placeholder="비밀번호 확인" onChange={event => {
        setPassword2(event.target.value);
      }} /></p>

      <p><input className="btn" type="submit" value="회원가입" onClick={() => {
        const userData = {
          userId: id,
          userPassword: password,
          userPassword2: password2,
        };
        axios.post("http://localhost:3001/signin", userData)
          .then((response) => {
            const json = response.data;
            if(json.isSuccess==="True"){
              alert('회원가입이 완료되었습니다!')
              navigate('/login');
            }
            else{
              alert(json.isSuccess)
            }
          })
          .catch((error) => {
            console.error("Axios POST request error: ", error);
          });
      }} /></p>
    </div>

    <p>로그인화면으로 돌아가기  <button onClick={() => {
      navigate('/login');
    }}>로그인</button></p>
  </> 
}

function Welcome() {
  return (
    <>
      <h2>메인 페이지에 오신 것을 환영합니다</h2>
      <p>로그인에 성공하셨습니다.</p>
      <Link to="/">로그인</Link>
    </>
  );
}

function App() {
  useEffect(() => {
    axios.post('http://localhost:3001/authcheck')
      .then(response => {
        const json = response.data;  
        if (json.isLogin === "True") {
          window.location.replace('/welcome');
        }
        else {
          window.location.replace('/login');
        }
      })
      .catch(error => {
        console.error('Error checking authentication:', error);
      });
  }, []); 

  return (
    <BrowserRouter>
      <div className="background">
        <Routes>
          <Route path='/' element={<Main />}></Route>
          <Route path='/login' element={<Login />}></Route>
          <Route path='/signin' element={<Signin />}></Route>
          <Route path='/welcome' element={<Welcome />}></Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
import './App.css';
import { useState, useEffect } from 'react';
import { useNavigate, BrowserRouter, Routes, Route, Link, useParams } from 'react-router-dom';
import axios from 'axios';

function Main() {
  return (
    <>
      <h2>홈페이지</h2>
      <Link to="/login">로그인</Link>
      <span className="link-gap">|</span>
      <Link to="/signin">회원가입</Link>
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
            const json = response.data;
            if (json.isLogin === "True") {
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
  const [name, setName] = useState("");
  const [id, setId] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");

  return <>
    <h2>회원가입</h2>

    <div className="form">
      <p><input className="login" type="text" placeholder="이름" onChange={event => {
        setName(event.target.value);
      }} /></p>
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
          userName: name,
          userId: id,
          userPassword: password,
          userPassword2: password2,
        };
        axios.post("http://localhost:3001/signin", userData)
          .then((response) => {
            const json = response.data;
            if (json.isSuccess === "True") {
              alert('회원가입이 완료되었습니다!')
              navigate('/login');
            }
            else {
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

function Welcome(props) {
  const navigate = useNavigate();

  const handleBoards = () => {
    navigate('/boards');
  };
  const handleLogout = () => {
    navigate('/')
  }
  return (
    <>
      <h3>Home</h3>
      <Mypage />
      <button className="btn" onClick={handleBoards}>게시글 조회</button>
      <button className="btn" onClick={handleLogout}>로그아웃</button>
    </>
  );
}

function Mypage() {
  const navigate = useNavigate();
  const [userData, setUserData] = useState({});
  const [userPosts, setUserPosts] = useState([]);

  const handleComments = (postId) => {
    navigate(`/comments/${postId}`);
  };

  useEffect(() => {
    axios.get("http://localhost:3001/userdata", userData)
      .then(response => {
        const json = response.data;
        setUserData(json.userData);
        setUserPosts(json.userPosts);
      })
      .catch(error => {
        console.error('Error checking authentication:', error);
      });
  }, []);

  const handleDeletePost = () => {
    axios.delete("http://localhost:3001/posts")
      .then(response => {
        const json = response.data;
        if (json.isSuccess) {
          setUserPosts([]);
        } else {
          console.log('게시글 삭제에 실패했습니다.');
        }
      })
      .catch(error => {
        console.error('Error deleting post:', error);
      });
  };

  return (
    <>
      <h1>마이페이지</h1>
      <>
        <li>
          <p><strong>이름:</strong> {userData.name}</p>
          <p><strong>아이디:</strong> {userData.id}</p>
        </li>
        <button className="btn" onClick={handleDeletePost}>모든 게시글 삭제</button>
        <p><strong>내가 작성한 게시글:</strong></p>
        <ul>
          {userPosts.map((post, index) => (
            <li key={index} onClick={() => handleComments(post.idx)}>
              <strong>내용:</strong>{post.content}
            </li>
          ))}
        </ul>
      </>
    </>
  );
}

function Board() {
  const navigate = useNavigate();
  const [allPosts, setAllPosts] = useState([]);

  const handlePosts = () => {
    navigate('/posts');
  }
  const handleMypage = () => {
    navigate('/welcome');
  }
  const handleComments = (postId) => {
    navigate(`/comments/${postId}`);
  };

  useEffect(() => {
    axios.get("http://localhost:3001/boards")
      .then(response => {
        const json = response.data;
        setAllPosts(json.allPosts);
      })
      .catch(error => {
        console.error('Error fetching posts:', error);
      });
  }, []);

  return (
    <div>
      <h2>모든 게시글 조회</h2>
      <button className="btn" onClick={handlePosts}>글쓰기</button>
      <ul>
        {allPosts.map((post, index) => (
          <li key={index} onClick={() => handleComments(post.idx)}>
            <strong>작성자:</strong> {post.name} <strong>내용:</strong> {post.content}
          </li>
        ))}
      </ul>
      <button className="btn" onClick={handleMypage}>돌아가기</button>
    </div>
  );
}

function Post() {
  const navigate = useNavigate();
  const [content, setContent] = useState('');

  const handleMypage = () => {
    navigate('/boards');
  }

  const handleSubmit = () => {
    const postData = {
      userContent: content,
    };

    axios.post("http://localhost:3001/posts", postData)
      .then(response => {
        const json = response.data;
        if (json.isSuccess) {
          alert('게시글이 작성되었습니다!');
        }
        else {
          alert('게시글 작성에 실패했습니다.');
        }
      })
      .catch(error => {
        console.error("Axios POST request error: ", error);
      });
  };

  return (
    <div>
      <h2>게시글 작성</h2>
      <textarea className="login" value={content} onChange={(e) => setContent(e.target.value)}></textarea>
      <button className="btn" onClick={handleSubmit}>업로드</button>
      <button className="btn" onClick={handleMypage}>목록</button>
    </div>
  );
}

function Comment() {
  const { postId } = useParams();
  const [postContent, setPostContent] = useState('');
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    axios.get(`http://localhost:3001/comments/${postId}`)
      .then(response => {
        const json = response.data;
        setPostContent(json.postContent || '');
        setComments(json.comment || []);
      })
      .catch(error => {
        console.error('Error fetching comments:', error);
      });
  }, [postId]);

  const handleSubmitComment = () => {
    axios.post(`http://localhost:3001/comments/${postId}`, { comment: newComment, postId: postId })
      .then(response => {
        const json = response.data;
        if (json.isSuccess) {
          setComments(prevComments => [...prevComments, { writer: json.writer, comment: newComment }]);
          setNewComment('');
        } else {
          alert('댓글 작성에 실패했습니다.');
        }
      })
      .catch(error => {
        console.error('Error posting comment:', error);
      });
  };

  return (
    <div className="comment-container">
      <Link to="/boards">게시글 목록</Link>
      <p className="post-content" style={{ fontSize: '25px' }}>{postContent}</p>
      <h2 style={{ fontSize: '1rem' }} className="comment-heading">댓글</h2>
      <ul className="comment-list">
        {comments.map((comment, index) => (
          <li key={index} className="comment-item">{comment.writer}: {comment.comment}</li>
        ))}
      </ul>
      <div className="comment-input-container">
        <textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} className="comment-input"></textarea>
        <button className="comment-btn" onClick={handleSubmitComment}>댓글 작성</button>
      </div>
    </div>
  );
}

function App() {

  return (
    <BrowserRouter>
      <div className="background">
        <Routes>
          <Route path='/' element={<Main />}></Route>
          <Route path='/login' element={<Login />}></Route>
          <Route path='/signin' element={<Signin />}></Route>
          <Route path='/welcome' element={<Welcome />}></Route>
          <Route path='/boards' element={<Board />}></Route>
          <Route path='/posts' element={<Post />}></Route>
          <Route path='/comments/:postId' element={<Comment />}></Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
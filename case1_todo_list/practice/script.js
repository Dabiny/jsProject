;(function () {
  'use strict';

  const get = (target) => {
    return document.querySelector(target)
  };

  const URL = `http://localhost:3000/todos`;
  const $todos = get('.todos');
  const $form = get('.todo_form');
  const $todoInput = get('.todo_input');


  const createTodoElement = (item) => {
    const { id, content, completed } = item
    // isChecked로 체크상태 유지시켜주기 
    const isChecked = completed ? 'checked' : '';
    const $todoItem = document.createElement('div')
    $todoItem.classList.add('item')
    $todoItem.dataset.id = id
    // innerHTML안에 isChecked 추가 
    $todoItem.innerHTML = `
            <div class="content">
              <input
                type="checkbox"
                class='todo_checkbox' 
                ${isChecked} 
              />
              <label>${content}</label>
              <input type="text" value="${content}" />
            </div>
            <div class="item_buttons content_buttons">
              <button class="todo_edit_button">
                <i class="far fa-edit"></i>
              </button>
              <button class="todo_remove_button">
                <i class="far fa-trash-alt"></i>
              </button>
            </div>
            <div class="item_buttons edit_buttons">
              <button class="todo_edit_confirm_button">
                <i class="fas fa-check"></i>
              </button>
              <button class="todo_edit_cancel_button">
                <i class="fas fa-times"></i>
              </button>
            </div>
      `
    return $todoItem
  }

  // 3. renderAllTodos: then에서 반환된 프로미스를 todos프로미스를 가지고 
  // 목록에 버튼과 요소들을 추가해서 하나의 세트로 꾸며줄 것(렌더링)이다. 
  function renderAllTodos (todos) {
    $todos.innerHTML = ''; // innerHTML 초기화 해주기
    // todos를 돌면서 요소(버튼 인풋..등) 추가해주기
    todos.forEach((value) => {
      const element = createTodoElement(value);
      $todos.appendChild(element);
    });
  }

  // getTodos: fetch에서 resolve되면 서버의 데이터를 가져온 다음, 
  // 가져온 데이터를 투두리스트 목록에 업데이트 시켜놔야한다. 
  function getTodos() {
    fetch(URL)
    .then(response => response.json())
    .then((todos) => { renderAllTodos(todos) })
    .catch(err => console.error(err));
  }

  // 4. addTodo: 할일을 입력하면 db저장소에 데이터를 보내는 함수
  function addTodo(e) {
    e.preventDefault(); // ajax에 맞게 할때마다 새로고침되지 않게 설정
    const content = $todoInput.value; // 입력값을 content에 넣기

    if (!content) return;
    
    // 객체에 저장해놓기
    const todo = { 
      content, // 입력값
      completed: false // 체크박스
    };

    // 저장한 객체를 fetch를 통해 db로 저장.
    fetch(URL, {
      method: 'POST', 
      headers: {'content-type': 'application/json'},
      body: JSON.stringify(todo)
    })
    .then(response => response.json())
    .then(getTodos) // db에 저장하고 다시 로딩하기 
    .then(() => { // 입력 인풋을 다시 초기화 해주기 
      $todoInput.value = '';
      $todoInput.focus();
    })
    .catch(err => console.error(err));
  }

  // 5. toggle을 체크하면 db데이터에 완료여부를 바꾸는 함수
  function toggleTodo (e) {
    // todos의 요소중 checkbox가 아니면 동작하지 않게 설정
    if (e.target.className !== 'todo_checkbox') return;

    // $todos의 요소중 젤 가까운 .item을 선택
    const $item = e.target.closest('.item');
    // item의 id 획득
    const id = $item.dataset.id;
    const completed = e.target.checked; // 체크 여부

    // 체크여부와 id획득 후 fetch를 통해 체크여부 보내기
    fetch(`${URL}/${id}`, {
      method: 'PATCH',
      headers: {'content-type': 'application/json'},
      body: JSON.stringify({ completed }) // 디스트럭처링을 통해 completed 요소만 변경
    })
    .then(response => response.json())
    .then(getTodos)
    .catch(err => console.error(err));

  }

  //7. 수정된 할일을 데베에 다시 업데이트 하기 
  function editTodo (e) {
    if(e.target.className !== 'todo_edit_confirm_button') return;

    const $item = e.target.closest('.item');
    const id = $item.dataset.id; // 'todos/{id}' 붙이기 위해 dataset에서 id 가져오기
    const $editInput = $item.querySelector('input[type="text"]');
    const content = $editInput.value;

    fetch(`${URL}/${id}`, {
      method: 'PATCH',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ content })
    })
    .then(response =>  response.json())
    .then(getTodos)
    .catch(err => console.error(err));
  }
  
  //6. 할일 수정 및 수정, 취소 버튼 변경하는 함수
  function changeEditTodo (e) {
    const $item = e.target.closest('.item');
    const $label = $item.querySelector('label'); // 토글에 붙어있는 라벨
    const $editInput = $item.querySelector('input[type="text"]');
    const $contentButtons = $item.querySelector('.content_buttons');
    const $editButtons = $item.querySelector('.edit_buttons');

    // 인풋 value값을 계속 변수에 받기
    const value = $editInput.value;

    // 변경버튼이 눌려지면 인풋과 변경확인버튼이 나타나야됨 라벨이 없어지고
    if (e.target.className === 'todo_edit_button'){
      $label.style.display = 'none';
      $editInput.style.display = 'block';
      $contentButtons.style.display = 'none';
      $editButtons.style.display = 'block';
      
      // 포커스 커서를 뒤로 배치하기 
      $editInput.focus();
      $editInput.value = '';
      $editInput.value = value;
    }

    if (e.target.className === 'todo_edit_cancel_button'){
      $label.style.display = 'block';
      $editInput.style.display = 'none';
      $contentButtons.style.display = 'block';
      $editButtons.style.display = 'none';

      $editInput.value = $label.innerText;
    }
  }
  
  // 8. 삭제 함수
  function deleteTodo (e) {
    if (e.target.className !== 'todo_remove_button') return;
    const $item = e.target.closest('.item');
    const id = $item.dataset.id;

    fetch(`${URL}/${id}`, {
      method: 'DELETE',
    })
    .then(response => response.json())
    .then(getTodos)
    .catch(err => console.error(err));
  }

  // 1. 초기화 시켜주기
  const init = () => {
    window.addEventListener('DOMContentLoaded', () => {
      // 2. 서버에서 json데이터 가져오기  
      getTodos();  
    });
    $form.addEventListener('submit', addTodo);
    $todos.addEventListener('click', toggleTodo);
    $todos.addEventListener('click', changeEditTodo);
    $todos.addEventListener('click', editTodo);
    $todos.addEventListener('click', deleteTodo);
  }
  init()
})()

// 헷갈렸던 것들 
// closest()
// e.target() 
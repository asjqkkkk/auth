(() => {
  const STORAGE_PREFIX = "one_day_todos_";
  const signinSection = document.getElementById("signin");
  const appSection = document.getElementById("todo-app");
  const statusText = document.getElementById("signin-status");
  const userName = document.getElementById("user-name");
  const userEmail = document.getElementById("user-email");
  const userAvatar = document.getElementById("user-avatar");
  const signoutButton = document.getElementById("signout-button");
  const taskForm = document.getElementById("new-task-form");
  const taskInput = document.getElementById("task-input");
  const taskList = document.getElementById("task-list");
  const config = window.TODOS_CONFIG || {};
  const clientId = config.googleClientId;
  const state = {
    user: null,
    tasks: [],
  };

  const setStatus = (message, isError = false) => {
    if (!statusText) return;
    statusText.textContent = message;
    statusText.style.color = isError ? "#b91c1c" : "#475569";
  };

  const storageKey = () => {
    if (!state.user) return null;
    return `${STORAGE_PREFIX}${state.user.sub}`;
  };

  const loadTasks = () => {
    const key = storageKey();
    if (!key) {
      state.tasks = [];
      return;
    }
    try {
      state.tasks = JSON.parse(localStorage.getItem(key) || "[]");
    } catch (error) {
      console.error("无法解析任务数据", error);
      state.tasks = [];
    }
  };

  const persistTasks = () => {
    const key = storageKey();
    if (!key) return;
    localStorage.setItem(key, JSON.stringify(state.tasks));
  };

  const renderTasks = () => {
    taskList.innerHTML = "";
    if (!state.tasks.length) {
      const empty = document.createElement("li");
      empty.textContent = "暂时还没有待办事项，开始添加一个吧。";
      empty.style.justifyContent = "center";
      empty.style.color = "#94a3b8";
      taskList.appendChild(empty);
      return;
    }

    state.tasks.forEach((task) => {
      const li = document.createElement("li");
      li.dataset.id = task.id;
      li.classList.toggle("completed", Boolean(task.completed));

      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = Boolean(task.completed);
      checkbox.addEventListener("change", () => toggleTask(task.id));

      const text = document.createElement("span");
      text.textContent = task.text;
      text.style.flex = "1";

      const remove = document.createElement("button");
      remove.type = "button";
      remove.textContent = "删除";
      remove.addEventListener("click", () => removeTask(task.id));

      li.appendChild(checkbox);
      li.appendChild(text);
      li.appendChild(remove);
      taskList.appendChild(li);
    });
  };

  const toggleTask = (id) => {
    state.tasks = state.tasks.map((task) =>
      task.id === id ? { ...task, completed: !task.completed } : task
    );
    persistTasks();
    renderTasks();
  };

  const removeTask = (id) => {
    state.tasks = state.tasks.filter((task) => task.id !== id);
    persistTasks();
    renderTasks();
  };

  const addTask = (text) => {
    state.tasks = [
      {
        id: crypto.randomUUID
          ? crypto.randomUUID()
          : `task_${Date.now()}_${Math.random().toString(16).slice(2)}`,
        text,
        completed: false,
      },
      ...state.tasks,
    ];
    persistTasks();
    renderTasks();
  };

  const decodeJwt = (token) => {
    const payload = token.split(".")[1];
    const normalized = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decoded = atob(normalized);
    return JSON.parse(
      decodeURIComponent(
        decoded
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      )
    );
  };

  const updateUserInfo = () => {
    if (!state.user) return;
    userName.textContent = state.user.name || "Google 用户";
    userEmail.textContent = state.user.email || "";
    userAvatar.src = state.user.picture || "https://via.placeholder.com/48";
    userAvatar.alt = state.user.name || "avatar";
  };

  const showApp = () => {
    signinSection.classList.add("hidden");
    appSection.classList.remove("hidden");
    updateUserInfo();
    loadTasks();
    renderTasks();
  };

  const resetApp = () => {
    state.user = null;
    state.tasks = [];
    signinSection.classList.remove("hidden");
    appSection.classList.add("hidden");
    taskList.innerHTML = "";
    taskInput.value = "";
  };

  const handleCredentialResponse = ({ credential }) => {
    try {
      const profile = decodeJwt(credential);
      state.user = {
        sub: profile.sub,
        email: profile.email,
        name: profile.name,
        picture: profile.picture,
      };
      setStatus(`欢迎回来，${state.user.name}！`);
      showApp();
    } catch (error) {
      console.error("解析 Google 登录信息失败", error);
      setStatus("解析 Google 登录信息失败，请稍后再试。", true);
    }
  };

  const initGoogle = () => {
    if (!clientId || clientId.includes("YOUR_GOOGLE_CLIENT_ID")) {
      setStatus("请先在 todos/config.js 中配置有效的 Google OAuth Client ID。", true);
      return;
    }

    const start = () => {
      google.accounts.id.initialize({
        client_id: clientId,
        callback: handleCredentialResponse,
        ux_mode: "popup",
      });
      google.accounts.id.renderButton(document.getElementById("g_id_signin"), {
        type: "standard",
        theme: "filled_blue",
        size: "large",
        text: "signin_with",
        width: 320,
      });
      google.accounts.id.prompt();
      setStatus("等待 Google 登录。");
    };

    if (window.google && window.google.accounts && window.google.accounts.id) {
      start();
    } else {
      const timer = window.setInterval(() => {
        if (window.google && window.google.accounts && window.google.accounts.id) {
          window.clearInterval(timer);
          start();
        }
      }, 100);
    }
  };

  signoutButton.addEventListener("click", () => {
    google?.accounts.id.disableAutoSelect();
    setStatus("您已退出登录。");
    resetApp();
  });

  taskForm.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!state.user) {
      setStatus("请先完成登录。", true);
      return;
    }
    const value = taskInput.value.trim();
    if (!value) return;
    addTask(value);
    taskForm.reset();
    taskInput.focus();
  });

  document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("g_id_signin")) {
      setStatus("未找到登录按钮容器。", true);
      return;
    }
    initGoogle();
  });
})();

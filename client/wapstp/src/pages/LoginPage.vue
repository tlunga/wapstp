<template>
    <div>
      <LoginForm @userLoggedIn="$router.push('/dashboard')" />
    </div>
  </template>
  
  <script>
  import LoginForm from '../components/LoginForm.vue';
  export default {
    components: { LoginForm }
  };
  </script>
  
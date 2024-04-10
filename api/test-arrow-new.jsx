const setLastVisit = () => {
    setLocalStorage('lastVisit', Date.now())
    console.log('Last visit time set:', Date.now())
    // testing modification of arrow function
}
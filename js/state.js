const AppState = {
  user: null,
  days: {},
  quotes: {},
  kolo: [],
  wstyd: [],       // Dzienniczek wstydu: wpisy (js/wstyd.js, osobny klucz w Storage)        // Koło uczuć: zaznaczone „grupa|słowo” (js/kolo.js)
  calendarDate: new Date(),
  currentDay: null,
};

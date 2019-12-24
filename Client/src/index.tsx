import React, { Fragment } from 'react';
import ReactDOM from 'react-dom';
import 'typeface-roboto';
import CssBaseline from '@material-ui/core/CssBaseline';
import * as serviceWorker from './serviceWorker';
import '@core/utils/extensions.implementation';
import '@core/utils/validation-init';
import { HashRouter as Router } from 'react-router-dom';
import App from './App';
import KeyboardHandler from 'src/utils/KeyboardHandler';

console.log(`



        ██▀███   █████   ▄████  ██   ██████ ▄▄▄█████  █████  ██▀███       ██ ███   ██     ▄▄▄       ███▄    █      ▄▄▄        ██████   ██████  ██   ██████ ▄▄▄█████ 
       ▓██ ▒ ██▒▓█   ▀  ██▒ ▀█▒▓██▒▒██    ▒ ▓  ██▒ ▓▒▓█   ▀ ▓██ ▒ ██▒    ▓██░  ██▒▓██▒   ▒████▄     ██ ▀█   █     ▒████▄    ▒██    ▒ ▒██    ▒ ▓██▒▒██    ▒ ▓  ██▒ ▓▒
       ▓██ ░▄█ ▒▒███   ▒██░▄▄▄░▒██▒░ ▓██▄   ▒ ▓██░ ▒░▒███   ▓██ ░▄█ ▒    ▓██░ ██▓▒▒██░   ▒██  ▀█▄  ▓██  ▀█ ██▒    ▒██  ▀█▄  ░ ▓██▄   ░ ▓██▄   ▒██▒░ ▓██▄   ▒ ▓██░ ▒░
       ▒██▀▀█▄  ▒▓█  ▄ ░▓█  ██▓░██░  ▒   ██▒░ ▓██▓ ░ ▒▓█  ▄ ▒██▀▀█▄      ▒██▄█▓▒ ▒▒██░   ░██▄▄▄▄██ ▓██▒  ▐▌██▒    ░██▄▄▄▄██   ▒   ██▒  ▒   ██▒░██░  ▒   ██▒░ ▓██▓ ░ 
       ░██▓ ▒██▒░▒████▒░▒▓███▀▒░██░▒██████▒▒  ▒██▒ ░ ░▒████▒░██▓ ▒██▒    ▒██▒ ░  ░░██████▒▓█   ▓██▒▒██░   ▓██░     ▓█   ▓██▒▒██████▒▒▒██████▒▒░██░▒██████▒▒  ▒██▒ ░ 
       ░ ▒▓ ░▒▓░░░ ▒░ ░ ░▒   ▒ ░▓  ▒ ▒▓▒ ▒ ░  ▒ ░░   ░░ ▒░ ░░ ▒▓ ░▒▓░    ▒▓▒░ ░  ░░ ▒░▓  ░▒▒   ▓▒█░░ ▒░   ▒ ▒      ▒▒   ▓▒█░▒ ▒▓▒ ▒ ░▒ ▒▓▒ ▒ ░░▓  ▒ ▒▓▒ ▒ ░  ▒ ░░   
         ░▒ ░ ▒░ ░ ░  ░  ░   ░  ▒ ░░ ░▒  ░ ░    ░     ░ ░  ░  ░▒ ░ ▒░    ░▒ ░     ░ ░ ▒  ░ ▒   ▒▒ ░░ ░░   ░ ▒░      ▒   ▒▒ ░░ ░▒  ░ ░░ ░▒  ░ ░ ▒ ░░ ░▒  ░ ░    ░    
         ░░   ░    ░   ░ ░   ░  ▒ ░░  ░  ░    ░         ░     ░░   ░     ░░         ░ ░    ░   ▒      ░   ░ ░       ░   ▒   ░  ░  ░  ░  ░  ░   ▒ ░░  ░  ░    ░      
          ░        ░  ░      ░  ░        ░              ░  ░   ░                      ░  ░     ░  ░         ░           ░  ░      ░        ░   ░        ░           
                                                                                                                                                            

       - Copyright:       Mahan Air 2018 - 2019
       - Team Members:    Afshin Alizadeh | Ali Esmaili | Elnaz Nasiri | Hessamoddin A Shokravi | Mohammad Reza Hajibabaii | Shahriyar Entezam | Tahereh Kasepoor



`);

ReactDOM.render(
  <Fragment>
    <CssBaseline />
    <KeyboardHandler />
    <Router>
      <App />
    </Router>
  </Fragment>,
  document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();

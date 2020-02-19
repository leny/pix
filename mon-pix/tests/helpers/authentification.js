import { click, fillIn } from '@ember/test-helpers';
import visitWithAbortedTransition from './visit';

export async function authenticateByEmail(user) {
  await visitWithAbortedTransition('/connexion');
  await fillIn('#login', user.email);
  await fillIn('#password', user.password);
  await click('.button');
}

export async function authenticateByUsername(user) {
  await visitWithAbortedTransition('/connexion');
  await fillIn('#login', user.username);
  await fillIn('#password', user.password);
  await click('.button');
}

export async function authenticateByGAR(user) {
  await visitWithAbortedTransition('/?token=aaa.' + btoa(`{"user_id":${user.id},"source":"external","iat":1545321469,"exp":4702193958}`) + '.bbb');
}

export async function logout() {
  await visitWithAbortedTransition('/deconnexion');
}
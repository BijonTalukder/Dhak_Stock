import AppContainer from '@/src/AppContainer';
import { store } from '@/src/store/store';
import { Provider } from 'react-redux';

export default function Index() {
  return <Provider store={store}>
    <AppContainer />;
  </Provider>

}

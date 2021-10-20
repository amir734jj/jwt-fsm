import moment from 'moment';

import { JwtFsm } from '.';
import * as utility from './utility';

jest.mock('./utility');
const mockedUtility = utility as jest.Mocked<typeof utility>;

describe('JWT-FSM', () => {
  const renewMock = jest.fn().mockReturnValue('renewedToken');
  const recoverMock = jest.fn().mockReturnValue('token');

  let jwtFsm: JwtFsm;

  const sleep = (): Promise<void> => new Promise((r) => setTimeout(r, 100));

  test('recover is called upon instantiation', async () => {
    mockedUtility.validate.mockReturnValue(true);
    mockedUtility.tokenExpiresAt.mockReturnValue(
      moment().add(1, 'day').toDate(),
    );

    jwtFsm = new JwtFsm({
      renew: renewMock,
      recover: recoverMock,
    });
    await sleep();

    expect(recoverMock).toBeCalled();
    expect(renewMock).not.toBeCalled();
  });

  test('renew is called upon renewal of expired token', async () => {
    mockedUtility.validate.mockReturnValue(true);
    mockedUtility.tokenExpiresAt
      .mockReturnValueOnce(moment().add(1, 'minute').toDate())
      .mockReturnValueOnce(moment().add(100, 'minute').toDate());

    jwtFsm = new JwtFsm({
      renew: renewMock,
      recover: recoverMock,
    });

    await sleep();

    expect(recoverMock).toBeCalled();
    expect(renewMock).toBeCalled();
  });

  afterEach(() => {
    jwtFsm.dispose();
  });

  afterAll((done) => {
    jest.clearAllTimers();
    done();
  });
});

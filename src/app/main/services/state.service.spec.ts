import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';

import { StateService } from './state.service';
import { Question } from '../model/question.model';

const question: Question = {
  id: 7,
  name: 'Closure',
  answer: '',
  position: 1,
  category: 10,
  positiveCount: 0,
  negativeCount: 0,
};

describe('StateService', () => {
  let service: StateService;
  let http: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
      ],
    });
    service = TestBed.inject(StateService);
    http = TestBed.inject(HttpTestingController);
    service.questions$.next([question]);
  });

  afterEach(() => {
    http.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('increments good and bad answer marks and sends them to the API', () => {
    service.recordAnswerResult(7, 'good');
    service.recordAnswerResult(7, 'good');
    service.recordAnswerResult(7, 'bad');

    expect(service.getQuestion(7)).toEqual(jasmine.objectContaining({ positiveCount: 2, negativeCount: 1 }));

    const requests = http.match((req) => req.method === 'PUT' && req.url.endsWith('/questions/7'));
    expect(requests.length).toBe(3);
    expect(requests[2].request.body.positiveCount).toBe(2);
    expect(requests[2].request.body.negativeCount).toBe(1);
    requests.forEach((req) => req.flush({ ...question, positiveCount: 2, negativeCount: 1 }));
  });

  it('resets both answer marks and sends zeros to the API', () => {
    service.questions$.next([{ ...question, positiveCount: 2, negativeCount: 1 }]);
    service.resetAnswerScores(7);

    expect(service.getQuestion(7)).toEqual(jasmine.objectContaining({ positiveCount: 0, negativeCount: 0 }));

    const req = http.expectOne((request) => request.method === 'PUT' && request.url.endsWith('/questions/7'));
    expect(req.request.body.positiveCount).toBe(0);
    expect(req.request.body.negativeCount).toBe(0);
    req.flush({ ...question, positiveCount: 0, negativeCount: 0 });
  });
});

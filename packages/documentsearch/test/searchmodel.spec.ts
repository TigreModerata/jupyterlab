// Copyright (c) Jupyter Development Team.
// Distributed under the terms of the Modified BSD License.
import {
  GenericSearchProvider,
  SearchDocumentModel
} from '@jupyterlab/documentsearch';
import { Widget } from '@lumino/widgets';
import { PromiseDelegate } from '@lumino/coreutils';

class LogSearchProvider extends GenericSearchProvider {
  private _queryReceived: PromiseDelegate<RegExp | null>;

  constructor(widget: Widget) {
    super(widget);
    this._queryReceived = new PromiseDelegate();
  }
  get queryReceived(): Promise<RegExp | null> {
    return this._queryReceived.promise;
  }

  async startQuery(query: RegExp | null, filters = {}): Promise<void> {
    this._queryReceived.resolve(query);
    this._queryReceived = new PromiseDelegate();
  }
}

describe('documentsearch/searchmodel', () => {
  describe('SearchDocumentModel', () => {
    let provider: LogSearchProvider;
    let widget: Widget;
    let model: SearchDocumentModel;

    beforeEach(() => {
      widget = new Widget();
      provider = new LogSearchProvider(widget);
      model = new SearchDocumentModel(provider, 0);
    });

    afterEach(async () => {
      widget.dispose();
    });

    describe('#searchExpression', () => {
      it('should notify provider of new query when set', async () => {
        model.searchExpression = 'query';
        expect(model.searchExpression).toEqual('query');
        const query = (await provider.queryReceived)!;
        expect(query.test('query')).toEqual(true);
        query.lastIndex = 0;
        expect(query.test('test')).toEqual(false);
        query.lastIndex = 0;
      });
    });

    describe('#caseSensitive', () => {
      it('should start a case-sensitive query', async () => {
        model.searchExpression = 'query';
        model.caseSensitive = true;
        expect(model.caseSensitive).toEqual(true);
        let query = (await provider.queryReceived)!;
        expect(query.test('query')).toEqual(true);
        query.lastIndex = 0;
        expect(query.test('QUERY')).toEqual(false);
        query.lastIndex = 0;

        model.caseSensitive = false;
        expect(model.caseSensitive).toEqual(false);
        query = (await provider.queryReceived)!;
        expect(query.test('query')).toEqual(true);
        query.lastIndex = 0;
        expect(query.test('QUERY')).toEqual(true);
        query.lastIndex = 0;
      });
    });

    describe('#wholeWords', () => {
      it('should start a whole-words query', async () => {
        model.searchExpression = 'query';
        model.wholeWords = true;
        expect(model.wholeWords).toEqual(true);
        let query = (await provider.queryReceived)!;
        expect(query.test(' query ')).toEqual(true);
        query.lastIndex = 0;
        expect(query.test('XqueryX')).toEqual(false);
        query.lastIndex = 0;

        model.wholeWords = false;
        expect(model.wholeWords).toEqual(false);
        query = (await provider.queryReceived)!;
        expect(query.test(' query ')).toEqual(true);
        query.lastIndex = 0;
        expect(query.test('XqueryX')).toEqual(true);
        query.lastIndex = 0;
      });
    });
  });
});

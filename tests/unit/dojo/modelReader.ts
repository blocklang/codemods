const { describe, it } = intern.getPlugin('interface.bdd');
const { assert } = intern.getPlugin('chai');
import {stub} from 'sinon';
import * as fs from 'fs';
import * as glob from 'glob';
import * as modelReader from '../../../src/dojo/modelReader';

describe('dojo/modelReader', () => {

	it('readProjectJson: project.json not exists', () => {
        const existsSyncStub = stub(fs, "existsSync").returns(false);
        assert.isUndefined(modelReader.readProjectJson(""));
        existsSyncStub.restore();
    });
    
    it('readProjectJson: project.json exists but not valid json', () => {
        const existsSyncStub = stub(fs, "existsSync").returns(true);
        // 返回无效的 json
        const readFileSyncStub = stub(fs, "readFileSync").returns("{");
        assert.isUndefined(modelReader.readProjectJson(""));
        existsSyncStub.restore();
        readFileSyncStub.restore();
    });
    
    it('readProjectJson: project.json exists and valid', () => {
        const existsSyncStub = stub(fs, "existsSync").returns(true);
        // 返回无效的 json
        const readFileSyncStub = stub(fs, "readFileSync").returns(`{"name": "a", "version": "b"}`);
        const projectInfo = modelReader.readProjectJson("")!;
        assert.equal(projectInfo.name, "a");
        assert.equal(projectInfo.version, "b");
        existsSyncStub.restore();
        readFileSyncStub.restore();
    });

    it('readDependencesJson: dependences.json not exists', () => {
        const existsSyncStub = stub(fs, "existsSync").returns(false);
        assert.isUndefined(modelReader.readDependencesJson(""));
        existsSyncStub.restore();
    });
    
    it('readDependencesJson: dependences.json exists but not valid json', () => {
        const existsSyncStub = stub(fs, "existsSync").returns(true);
        // 返回无效的 json
        const readFileSyncStub = stub(fs, "readFileSync").returns("[");
        assert.isUndefined(modelReader.readDependencesJson(""));
        existsSyncStub.restore();
        readFileSyncStub.restore();
    });
    
    it('readDependencesJson: dependences.json exists and valid', () => {
        const existsSyncStub = stub(fs, "existsSync").returns(true);
        // 返回无效的 json
        const readFileSyncStub = stub(fs, "readFileSync").returns("[]");
        const dependences = modelReader.readDependencesJson("")!;
        assert.isEmpty(dependences);
        existsSyncStub.restore();
        readFileSyncStub.restore();
    });

    it('readAllPageModels: no page model', () => {
        const globSyncStub = stub(glob, "sync").returns([]);
        assert.isEmpty(modelReader.readAllPageModels(""));
        globSyncStub.restore();
    });
});

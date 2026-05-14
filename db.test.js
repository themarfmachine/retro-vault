import { describe, it, expect, beforeEach, afterAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { getGamesData, setDataFile } from './db';

const TEST_DATA_FILE = path.join(__dirname, 'games.test.json');

describe('db logic', () => {
  beforeEach(() => {
    // Reset test file before each test
    if (fs.existsSync(TEST_DATA_FILE)) {
      fs.unlinkSync(TEST_DATA_FILE);
    }
    setDataFile(TEST_DATA_FILE);
  });

  afterAll(() => {
    // Cleanup test file after all tests
    if (fs.existsSync(TEST_DATA_FILE)) {
      fs.unlinkSync(TEST_DATA_FILE);
    }
  });

  it('defaults missing player counts to 1', () => {
    const testData = [
      { title: 'Test Game', platform: 'NES' }
    ];
    fs.writeFileSync(TEST_DATA_FILE, JSON.stringify(testData));

    const games = getGamesData();
    expect(games[0].players).toBe(1);
  });

  it('preserves existing player counts', () => {
    const testData = [
      { title: 'Gauntlet', platform: 'Arcade', players: 4 }
    ];
    fs.writeFileSync(TEST_DATA_FILE, JSON.stringify(testData));

    const games = getGamesData();
    expect(games[0].players).toBe(4);
  });

  it('filters for 4-player games', () => {
    const testData = [
      { title: 'Gauntlet', platform: 'Arcade', players: 4 },
      { title: 'Mario Kart', platform: 'N64', players: 4 },
      { title: 'Zelda', platform: 'NES', players: 1 }
    ];
    fs.writeFileSync(TEST_DATA_FILE, JSON.stringify(testData));

    const games = getGamesData();
    const fourPlayerGames = games.filter(g => g.players === 4);
    
    expect(fourPlayerGames).toHaveLength(2);
    expect(fourPlayerGames.map(g => g.title)).toContain('Gauntlet');
    expect(fourPlayerGames.map(g => g.title)).toContain('Mario Kart');
  });

  it('initializes file if it does not exist', () => {
    // Ensure file doesn't exist
    if (fs.existsSync(TEST_DATA_FILE)) {
      fs.unlinkSync(TEST_DATA_FILE);
    }

    const games = getGamesData();
    expect(fs.existsSync(TEST_DATA_FILE)).toBe(true);
    expect(JSON.parse(fs.readFileSync(TEST_DATA_FILE, 'utf8'))).toEqual([]);
    expect(games).toEqual([]);
  });
});

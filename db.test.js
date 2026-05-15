import { describe, it, expect, beforeEach, afterAll, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { getGamesData, setDataFile } from './db';
import * as igdbService from './igdbService';

const TEST_DATA_FILE = path.join(__dirname, 'games.test.json');

// Mock the IGDB service so we don't make real API calls during tests
vi.mock('./igdbService', () => ({
  getGameCover: vi.fn().mockResolvedValue(null)
}));

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

  it('throws an error for invalid data', () => {
    const invalidData = [
      { title: 'Valid Game', platform: 'NES', players: 2 },
      { title: 'Invalid Game', platform: 123 }, // platform should be string
      { title: 'Another Valid', platform: 'SNES', players: 4 }
    ];
    fs.writeFileSync(TEST_DATA_FILE, JSON.stringify(invalidData));

    // Suppress console.error for this specific test so it doesn't clutter the test output
    const originalConsoleError = console.error;
    console.error = () => {};

    expect(() => getGamesData()).toThrow('DATA CORRUPTION');

    // Restore console.error
    console.error = originalConsoleError;
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

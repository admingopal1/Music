const $ = (selector) => document.querySelector(selector);
const icon = (name) => `<svg aria-hidden="true"><use href="#i-${name}"></use></svg>`;
const tracks = [
  { title: 'SoundHelix Song 1', artist: 'SoundHelix', mood: 'Easy listening', image: 'assets/mountains.jpg', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3' },
  { title: 'SoundHelix Song 2', artist: 'SoundHelix', mood: 'Feel good', image: 'assets/studio.jpg', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3' },
  { title: 'SoundHelix Song 3', artist: 'SoundHelix', mood: 'After hours', image: 'assets/stage.jpg', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3' },
  { title: 'SoundHelix Song 4', artist: 'SoundHelix', mood: 'In the mix', image: 'assets/concert.jpg', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3' },
  { title: 'SoundHelix Song 5', artist: 'SoundHelix', mood: 'On repeat', image: 'assets/console.jpg', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3' },
  { title: 'SoundHelix Song 6', artist: 'SoundHelix', mood: 'Good energy', image: 'assets/festival.jpg', src: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-6.mp3' },
];
const moods = [
  { title: 'The slow down', subtitle: 'Breathe in. Tune out.', image: 'assets/mountains.jpg', track: 0 },
  { title: 'Good energy', subtitle: 'A little lift for your day.', image: 'assets/studio.jpg', track: 1 },
  { title: 'After hours', subtitle: 'For the late night feelings.', image: 'assets/stage.jpg', track: 2 },
  { title: 'In the moment', subtitle: 'Turn it up, stay awhile.', image: 'assets/concert.jpg', track: 3 },
];
const audio = $('#audio');
const video = $('#video');
const dialog = $('#video-dialog');
let current = 0;
let view = 'home';
let shuffled = false;
let repeating = false;
let liked = [];
try { liked = JSON.parse(localStorage.getItem('sonora-liked') || '[]'); if (!Array.isArray(liked)) liked = []; } catch { liked = []; }
const formatTime = (seconds) => Number.isFinite(seconds) ? `${Math.floor(seconds / 60)}:${String(Math.floor(seconds % 60)).padStart(2, '0')}` : '0:00';
function setIcon(element, name) { element.innerHTML = icon(name); }
function setPlayIcons() {
  const playing = !audio.paused;
  setIcon($('#play'), playing ? 'pause' : 'play');
  $('#play').setAttribute('aria-label', playing ? 'Pause' : 'Play');
}
function updateLikes() {
  document.querySelectorAll('.like-button').forEach(button => {
    const index = button.dataset.index === undefined ? current : Number(button.dataset.index);
    const active = liked.includes(index);
    button.classList.toggle('active', active);
    button.setAttribute('aria-label', `${active ? 'Unlike' : 'Like'} ${tracks[index].title}`);
    button.setAttribute('aria-pressed', String(active));
  });
}
function toggleLike(index) {
  liked = liked.includes(index) ? liked.filter(item => item !== index) : [...liked, index];
  try { localStorage.setItem('sonora-liked', JSON.stringify(liked)); } catch { /* Playback works even when storage is unavailable. */ }
  if (view === 'liked') renderView(); else updateLikes();
}
function loadTrack(index, autoplay = false) {
  current = (index + tracks.length) % tracks.length;
  const track = tracks[current];
  audio.src = track.src;
  $('#now-art').src = $('#player-art').src = track.image;
  $('#now-title').textContent = $('#player-title').textContent = track.title;
  $('#now-artist').textContent = $('#player-artist').textContent = track.artist;
  $('#seek').value = 0; $('#current-time').textContent = '0:00'; $('#duration').textContent = '0:00';
  renderQueue(); updateLikes();
  if (autoplay) audio.play().catch(() => setPlayIcons());
}
function nextTrack() {
  const next = shuffled && tracks.length > 1 ? (current + 1 + Math.floor(Math.random() * (tracks.length - 1))) % tracks.length : (current + 1) % tracks.length;
  loadTrack(next, true);
}
function renderMoods(container = $('#mood-grid')) {
  container.innerHTML = moods.map((mood, index) => `<button class="mood-card" data-track="${mood.track}" aria-label="Play ${mood.title}"><div class="mood-image"><img src="${mood.image}" alt=""><span class="mood-number">0${index + 1} / SONORA SELECTS</span><span class="mood-play">${icon('play')}</span></div><strong>${mood.title}</strong><small>${mood.subtitle}</small></button>`).join('');
}
function trackRows(indices) {
  if (!indices.length) return '<p class="empty-state">No tracks here yet. Explore the collection and find something you love.</p>';
  return indices.map((index, position) => { const track = tracks[index]; return `<div class="track-row"><span class="track-index">${String(position + 1).padStart(2, '0')}</span><img src="${track.image}" alt=""><button class="track-name" data-track="${index}"><strong>${track.title}</strong><small>${track.artist}</small></button><span class="track-meta">${track.mood}</span><span class="track-length">—</span><button class="icon-button like-button" data-index="${index}" aria-label="Like ${track.title}">${icon('heart')}</button></div>`; }).join('');
}
function renderQueue() {
  $('#queue').innerHTML = [1, 2, 3].map(offset => { const index = (current + offset) % tracks.length; const track = tracks[index]; return `<button class="queue-item" data-track="${index}"><img src="${track.image}" alt=""><span><strong>${track.title}</strong><small>${track.artist}</small></span><span>›</span></button>`; }).join('');
}
function renderView() {
  const query = $('#search').value.trim().toLowerCase();
  const isHome = view === 'home' && !query;
  $('#home-view').classList.toggle('hidden', !isHome);
  $('#secondary-view').classList.toggle('hidden', isHome);
  document.querySelectorAll('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.view === view && !query));
  if (isHome) { updateLikes(); return; }
  const title = $('#page-title'), kicker = $('#page-kicker'), description = $('#page-description'), content = $('#secondary-content');
  if (query) {
    kicker.textContent = 'FIND YOUR SOUND'; title.textContent = 'Search results'; description.textContent = `Results for “${$('#search').value.trim()}”`;
    content.innerHTML = `<div class="track-table">${trackRows(tracks.map((_, i) => i).filter(i => `${tracks[i].title} ${tracks[i].artist} ${tracks[i].mood}`.toLowerCase().includes(query)))}</div>`;
  } else if (view === 'discover') {
    kicker.textContent = 'SOMETHING FOR EVERY MOMENT'; title.textContent = 'Discover your mood'; description.textContent = 'Find a new favorite and let the music take over.';
    content.innerHTML = '<div class="secondary-grid" id="discover-moods"></div>'; renderMoods($('#discover-moods'));
  } else if (view === 'videos') {
    kicker.textContent = 'SOUND MEETS VISION'; title.textContent = 'Music videos'; description.textContent = 'Sit back, press play and stay for a while.';
    content.innerHTML = `<div class="video-card"><div class="video-card-image"><button class="play-main" data-video aria-label="Play A moment in bloom">${icon('play')}</button></div><div class="video-card-content"><h3>A moment in bloom</h3><p>A little visual escape, just for you.</p><button class="button button-light" data-video>${icon('play')} Watch now</button></div></div>`;
  } else {
    const isLiked = view === 'liked';
    kicker.textContent = isLiked ? 'YOUR COLLECTION' : 'THE SONORA COLLECTION'; title.textContent = isLiked ? 'Liked songs' : 'All tracks'; description.textContent = isLiked ? 'All the tracks that feel like you.' : 'A little something for every kind of day.';
    content.innerHTML = `<div class="track-table">${trackRows(isLiked ? liked : tracks.map((_, i) => i))}</div>`;
  }
  updateLikes();
}
function changeView(next) { view = next; $('#search').value = ''; renderView(); $('.content').scrollIntoView({ behavior: 'smooth', block: 'start' }); }
function openVideo() { audio.pause(); dialog.showModal(); $('#video-stage').focus(); video.play().catch(() => {}); }
function closeVideo() { video.pause(); if (document.pictureInPictureElement === video) document.exitPictureInPicture().catch(() => {}); dialog.close(); }
renderMoods(); $('#home-tracks').innerHTML = trackRows([0, 1, 2]); loadTrack(0); audio.volume = 0.75;
document.addEventListener('click', event => {
  const nav = event.target.closest('[data-view]'); if (nav) return changeView(nav.dataset.view);
  const go = event.target.closest('[data-go]'); if (go) return changeView(go.dataset.go);
  const like = event.target.closest('.like-button'); if (like) return toggleLike(like.dataset.index === undefined ? current : Number(like.dataset.index));
  const track = event.target.closest('[data-track]'); if (track) return loadTrack(Number(track.dataset.track), true);
  if (event.target.closest('[data-video]')) openVideo();
});
$('.brand').addEventListener('click', event => { event.preventDefault(); changeView('home'); });
$('#search').addEventListener('input', renderView);
$('#hero-play').addEventListener('click', () => audio.play().catch(() => {}));
['#hero-video', '#promo-video', '#open-video'].forEach(selector => $(selector).addEventListener('click', openVideo));
$('#play').addEventListener('click', () => audio.paused ? audio.play().catch(() => {}) : audio.pause());
$('#previous').addEventListener('click', () => audio.currentTime > 3 ? audio.currentTime = 0 : loadTrack(current - 1, true));
$('#next').addEventListener('click', nextTrack);
$('#shuffle').addEventListener('click', event => { shuffled = !shuffled; event.currentTarget.classList.toggle('active', shuffled); event.currentTarget.setAttribute('aria-pressed', String(shuffled)); });
$('#repeat').addEventListener('click', event => { repeating = !repeating; audio.loop = repeating; event.currentTarget.classList.toggle('active', repeating); event.currentTarget.setAttribute('aria-pressed', String(repeating)); });
function showStatus(message) { const status = $('#player-status'); status.textContent = message; status.classList.remove('hidden'); clearTimeout(showStatus.timer); showStatus.timer = setTimeout(() => status.classList.add('hidden'), 5000); }
audio.addEventListener('error', () => showStatus('This track could not be loaded. Please try another track.'));
video.addEventListener('error', () => { $('#video-status').textContent = 'The video could not be loaded. Please try again.'; $('#video-status').classList.remove('hidden'); });
audio.addEventListener('play', setPlayIcons); audio.addEventListener('pause', setPlayIcons); audio.addEventListener('ended', nextTrack);
audio.addEventListener('timeupdate', () => { $('#current-time').textContent = formatTime(audio.currentTime); $('#seek').value = audio.duration ? audio.currentTime / audio.duration * 100 : 0; });
audio.addEventListener('loadedmetadata', () => $('#duration').textContent = formatTime(audio.duration));
$('#seek').addEventListener('input', event => { if (Number.isFinite(audio.duration)) audio.currentTime = Number(event.target.value) / 100 * audio.duration; });
$('#volume').addEventListener('input', event => { audio.volume = Number(event.target.value); audio.muted = false; });
$('#mute').addEventListener('click', () => { audio.muted = !audio.muted; $('#mute').classList.toggle('active', audio.muted); $('#mute').setAttribute('aria-label', audio.muted ? 'Unmute' : 'Mute'); });
$('.close-video').addEventListener('click', closeVideo);
dialog.addEventListener('cancel', event => { event.preventDefault(); closeVideo(); });
dialog.addEventListener('click', event => { if (event.target === dialog) closeVideo(); });
function toggleVideo() { video.paused ? video.play().catch(() => {}) : video.pause(); }
$('#video-play').addEventListener('click', toggleVideo); $('#video-overlay-play').addEventListener('click', toggleVideo); video.addEventListener('click', toggleVideo);
function updateVideoState() { const playing = !video.paused; setIcon($('#video-play'), playing ? 'pause' : 'play'); $('#video-play').setAttribute('aria-label', playing ? 'Pause video' : 'Play video'); $('#video-overlay-play').classList.toggle('hidden', playing); }
video.addEventListener('play', updateVideoState); video.addEventListener('pause', updateVideoState);
function updateVideoTime() { $('#video-time').textContent = `${formatTime(video.currentTime)} / ${formatTime(video.duration)}`; $('#video-seek').value = video.duration ? video.currentTime / video.duration * 100 : 0; }
video.addEventListener('timeupdate', updateVideoTime); video.addEventListener('loadedmetadata', updateVideoTime);
$('#video-seek').addEventListener('input', event => { if (Number.isFinite(video.duration)) video.currentTime = Number(event.target.value) / 100 * video.duration; });
$('#video-back').addEventListener('click', () => video.currentTime = Math.max(0, video.currentTime - 10));
$('#video-forward').addEventListener('click', () => { if (Number.isFinite(video.duration)) video.currentTime = Math.min(video.duration, video.currentTime + 10); });
$('#video-volume').addEventListener('input', event => { video.volume = Number(event.target.value); video.muted = false; });
$('#video-mute').addEventListener('click', () => { video.muted = !video.muted; $('#video-mute').classList.toggle('active', video.muted); $('#video-mute').setAttribute('aria-label', video.muted ? 'Unmute video' : 'Mute video'); });
$('#video-speed').addEventListener('change', event => video.playbackRate = Number(event.target.value));
$('#video-fullscreen').addEventListener('click', () => { if (document.fullscreenElement) document.exitFullscreen(); else $('#video-stage').requestFullscreen().catch(() => {}); });
$('#video-pip').hidden = !document.pictureInPictureEnabled;
$('#video-pip').addEventListener('click', () => { if (document.pictureInPictureElement) document.exitPictureInPicture().catch(() => {}); else video.requestPictureInPicture().catch(() => {}); });
document.addEventListener('keydown', event => {
  if (event.key === '/' && !dialog.open && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) { event.preventDefault(); $('#search').focus(); }
  if (!dialog.open || ['INPUT', 'SELECT', 'TEXTAREA'].includes(document.activeElement.tagName)) return;
  if (event.code === 'Space' && document.activeElement.tagName !== 'BUTTON') { event.preventDefault(); toggleVideo(); }
  if (event.key === 'ArrowLeft') video.currentTime = Math.max(0, video.currentTime - 5);
  if (event.key === 'ArrowRight' && Number.isFinite(video.duration)) video.currentTime = Math.min(video.duration, video.currentTime + 5);
});

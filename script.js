const tabs = document.querySelectorAll('.tab');
const panels = document.querySelectorAll('.tab-panel');

for (const tab of tabs) {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;

    tabs.forEach((button) => {
      button.classList.toggle('active', button === tab);
    });

    panels.forEach((panel) => {
      panel.classList.toggle('active', panel.id === target);
    });
  });
}

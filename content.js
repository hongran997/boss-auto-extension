let isRunning = false;

// 随机延迟函数
async function randomDelay() {
  const delay = Math.floor(Math.random() * 2000) + 1000; // 1-3秒随机延迟
  await new Promise(resolve => setTimeout(resolve, delay));
}

const cities = ['上海', '杭州', '苏州', '北京', '深圳', '广州', '成都', '武汉', '西安', '天津', '重庆', '厦门', '长沙', '郑州', '全国'];

const cityIndex = 0;
// 添加一个函数来停止所有操作
function stopAllOperations() {
  isRunning = false;
  const button = document.getElementById('auto-apply-button');
  if (button) {
    button.className = 'auto-apply-button';
    button.textContent = '开始自动投递';
  }
}

// 主要的自动投递函数
async function autoApply() {
  if (!isRunning) return;

  try {
    // 等待职位列表加载
    const jobCards = document.querySelectorAll('.card-area:not([data-processed="true"])');

    if (jobCards.length === 0) {
      window.scrollBy(0, 800);
      
      const isAtBottom = window.innerHeight + window.pageYOffset >= document.documentElement.scrollHeight;
      if (isAtBottom) {
        console.log('已滚动到页面底部');
        // try to test;
        const locationBtn = document.querySelector('.city-label.active');  
        locationBtn.click();
        await randomDelay();
        // 选择下一个城市
        const index = cities.indexOf(locationBtn.textContent.trim());
        const cityIndex = (index + 1) % cities.length;
        const nextCity = cities[cityIndex];
        const cityBtn = Array.from(document.querySelectorAll('.city-list-hot>li')).find(btn => btn.textContent.trim() === nextCity);
        cityBtn.click();
        await randomDelay();
      }
      await randomDelay();
      autoApply();
      return;
    }

    for (const jobCard of jobCards) {
      try {
        if (!isRunning) return;
        // 标记该卡片为已处理
        jobCard.setAttribute('data-processed', 'true');

        // 查找并点击职位链接
        const jobLink = jobCard.querySelector('a[href*="job_detail"]');
        if (jobLink) {
          jobLink.click();
          await randomDelay();

          // 等待右侧详情页更新
          await new Promise(resolve => {
            const checkDetail = () => {
              const detailContainer = document.querySelector('div.job-detail-box');
              if (detailContainer) {
                resolve();
              } else {
                setTimeout(checkDetail, 100);
              }
            };
            checkDetail();
          });

          // 过滤掉半年前活跃的职位
          const activeTime = document.querySelector('.boss-active-time');
          const activeTimeText = ['半年前活跃', '3月内活跃', '2月内活跃'];
          if (activeTime && activeTimeText.includes(activeTime.textContent.trim())) {
            continue;
          }

          // 查找并点击"立即沟通"按钮
          const chatButton = document.querySelector(`a[ka*="cpc_job_list_chat_"][class*="op-btn-chat"]`);
          if (chatButton && chatButton.textContent.trim() === '立即沟通') {
            // 移除 href 属性，避免触发 javascript: URL
            const originalHref = chatButton.getAttribute('href');
            chatButton.removeAttribute('href');
            
            // 触发点击
            chatButton.click();
            
            // 恢复 href 属性
            chatButton.setAttribute('href', originalHref);
            
            await randomDelay();

            // 检查是否达到上限
            const limitText = document.querySelector('.chat-block-body p');
            if (limitText && limitText.textContent.trim() === '今日沟通人数已达上限，请明天再试') {
              stopAllOperations();
              return;
            }

            // 处理"留在此页"按钮
            const stayButton = document.querySelector('.default-btn.cancel-btn');
            if (stayButton && stayButton.textContent.trim() === '留在此页') {
              stayButton.removeAttribute('href');
              stayButton.click();
              stayButton.setAttribute('href', originalHref);
              await randomDelay();
            }
          }
        }
      } catch (error) {
        console.error('处理职位卡片时出错:', error);
        continue;
      }
    }

    setTimeout(autoApply, 1000);

  } catch (error) {
    console.log('发生错误', error);
    stopAllOperations();
  }
}

// 创建控制按钮
function createControlButton() {
  const button = document.createElement('button');
  button.id = 'auto-apply-button';
  button.className = 'auto-apply-button';
  button.textContent = '开始自动投递';
  document.body.appendChild(button);

  button.addEventListener('click', () => {
    isRunning = !isRunning;
    button.textContent = isRunning ? '停止自动投递' : '开始自动投递';
    button.className = isRunning ? 'auto-apply-button running' : 'auto-apply-button';
    if (isRunning) {
      autoApply();
    } else { 
      stopAllOperations();
    }
  });

  return button;
}

// 在页面加载完成后运行
createControlButton();


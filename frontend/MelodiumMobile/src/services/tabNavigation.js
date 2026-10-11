export function openHomeTab(navigation, activeTab) {
    if (activeTab === 'Social') navigation.replace('Home');
    else navigation.navigate('Home');
}

export function openDiaryTab(navigation, activeTab) {
    if (activeTab === 'Home') navigation.replace('Social');
    else navigation.navigate('Social');
}

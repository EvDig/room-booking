import os

def list_files(startpath):
    # Папки, которые мы не хотим видеть в отчете (системные или слишком большие)
    ignore_dirs = {'node_modules', '.git', 'dist', 'build', '.vscode', '__pycache__', '.idea'}
    
    for root, dirs, files in os.walk(startpath):
        # Удаляем папки из списка обхода, если они в ignore_dirs
        dirs[:] = [d for d in dirs if d not in ignore_dirs]
        
        level = root.replace(startpath, '').count(os.sep)
        indent = ' ' * 4 * (level)
        print(f'{indent}[{os.path.basename(root)}]')
        subindent = ' ' * 4 * (level + 1)
        for f in files:
            print(f'{subindent}{f}')

if __name__ == '__main__':
    print("--- Структура текущего проекта ---")
    list_files('.')
    print("----------------------------------")

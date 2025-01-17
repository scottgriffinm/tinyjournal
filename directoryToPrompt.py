import os

def generate_directory_contents_file(output_file, exclude_folders=None, exclude_files=None, include_files=None):
    if exclude_folders is None:
        exclude_folders = []
    if exclude_files is None:
        exclude_files = []
    if include_files is None:
        include_files = []
    
    # Add this script to excluded files
    current_script = os.path.basename(__file__)
    exclude_files.append(current_script)
    
    with open(output_file, 'w') as out_file:
        for root, dirs, files in os.walk('.'):
            # Remove excluded folders from the walk
            dirs[:] = [d for d in dirs if os.path.join(root, d) not in exclude_folders]
            
            for file in files:
                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path, start='.')

                # Handle the include_files list if provided
                if include_files:
                    if relative_path not in include_files:
                        continue
                else:
                    # Skip excluded files if include_files is not used
                    if any(ex_file in file_path for ex_file in exclude_files):
                        continue
                
                # Write the file path as a section header
                out_file.write(f'{relative_path}:\n\n')
                
                # Write the file contents
                try:
                    with open(file_path, 'r') as f:
                        out_file.write(f.read() + '\n')
                except Exception as e:
                    out_file.write(f'[ERROR READING FILE: {e}]\n')
                
                out_file.write('\n' + '-' * 80 + '\n')

if __name__ == '__main__':
    # Specify the output file name
    output_filename = 'dir_prompt.txt'
    
    # Exclusions (adjust these as needed)
    exclude_folders = ['./node_modules', './.next', './public', './.git', output_filename]
    exclude_files = ['package-lock.json', 'package.json', '.gitignore', '.env.local']
    
    # Specify the files to include (leave empty to include all files except exclusions)
    include_files = [
        'pages/api/create-entry.js',
        'pages/api/get-entries.js',
        'pages/api/get-entry.js',
        'pages/index.jsx',
        'pages/new-entry.jsx',
        'lib/localStorageCache.js',
    ]
    
    generate_directory_contents_file(output_filename, exclude_folders, exclude_files, include_files)
    print(f"Directory contents written to {output_filename}")